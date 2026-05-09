using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Wrappers;
using SmartInvestingAPI.Repositories;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly IMapper mapper;
        private readonly ITransactionRepository transactionRepository;
        private readonly IWalletRepository walletRepository;
        private readonly IPortfolioRepository portfolioRepository;

        public TransactionsController(
            IMapper mapper,
            ITransactionRepository transactionRepository,
            IWalletRepository walletRepository,
            IPortfolioRepository portfolioRepository)
        {
            this.mapper = mapper;
            this.transactionRepository = transactionRepository;
            this.walletRepository = walletRepository;
            this.portfolioRepository = portfolioRepository;
        }

        private Guid? GetUserIdOrFail()
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(rawUserId, out var userId) ? userId : null;
        }

        private async Task<bool> ValidateWalletOwnership(Guid walletId)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return false;

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return false;

            return true;
        }

        private async Task<bool> ValidateAssetOwnership(int assetId)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return false;

            var portfolio = await portfolioRepository.GetByUserAndAssetAsync(userId.Value, assetId);
            return portfolio != null;
        }

        private string GetModelStateErrors()
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return string.Join("; ", errors);
        }

        [HttpGet("/api/wallets/{walletId:Guid}/transactions")]
        public async Task<IActionResult> GetAllByWallet([FromRoute] Guid walletId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (!await ValidateWalletOwnership(walletId))
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var userId = GetUserIdOrFail()!.Value;
            var (transactions, totalCount) = await transactionRepository.GetTransactionsByWalletIdAsync(walletId, page, pageSize);
            var dto = mapper.Map<List<TransactionDto>>(transactions);

            var pagedResponse = PagedResponse<TransactionDto>.Create(dto, page, pageSize, totalCount);
            return Ok(ApiResponse<PagedResponse<TransactionDto>>.Ok(pagedResponse));
        }

        [HttpGet("/api/wallets/{walletId:Guid}/transactions/{transactionId:Guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid walletId, [FromRoute] Guid transactionId)
        {
            if (!await ValidateWalletOwnership(walletId))
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var transaction = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (transaction == null)
                return NotFound(ApiResponse.Fail("Transaction not found"));

            return Ok(ApiResponse<TransactionDto>.Ok(mapper.Map<TransactionDto>(transaction)));
        }

        [HttpPost("/api/wallets/{walletId:Guid}/transactions")]
        public async Task<IActionResult> Create([FromRoute] Guid walletId, [FromBody] AddTransactionRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail(GetModelStateErrors()));

            if (!await ValidateWalletOwnership(walletId))
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            if (request.AssetId.HasValue && !await ValidateAssetOwnership(request.AssetId.Value))
                return BadRequest(ApiResponse.Fail("Asset does not exist or does not belong to current user."));

            var transaction = mapper.Map<Transaction>(request);
            transaction.WalletId = walletId;
            transaction.TransactionDate = DateTime.UtcNow;
            transaction.IsActive = true;

            var created = await transactionRepository.CreateAsync(transaction);

            var createdWithNav = await transactionRepository.GetTransactionByIdAndWalletIdAsync(created.Id, walletId);
            if (createdWithNav == null)
                return Problem(detail: "Transaction was created but could not be reloaded.", statusCode: StatusCodes.Status500InternalServerError);

            var dto = mapper.Map<TransactionDto>(createdWithNav);

            return CreatedAtAction(nameof(GetById), new { walletId, transactionId = dto.Id },
                ApiResponse<TransactionDto>.Created(dto));
        }

        [HttpPut("/api/wallets/{walletId:Guid}/transactions/{transactionId:Guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid walletId, [FromRoute] Guid transactionId, [FromBody] UpdateTransactionRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid transaction data"));

            if (!await ValidateWalletOwnership(walletId))
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var existing = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (existing == null)
                return NotFound(ApiResponse.Fail("Transaction not found"));

            mapper.Map(request, existing);
            existing.Id = transactionId;
            existing.WalletId = walletId;

            var updated = await transactionRepository.UpdateAsync(existing);
            if (updated == null)
                return NotFound(ApiResponse.Fail("Transaction not found"));

            var updatedWithNav = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (updatedWithNav == null)
                return NotFound(ApiResponse.Fail("Transaction not found"));

            return Ok(ApiResponse<TransactionDto>.Ok(mapper.Map<TransactionDto>(updatedWithNav)));
        }

        [HttpDelete("/api/wallets/{walletId:Guid}/transactions/{transactionId:Guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid walletId, [FromRoute] Guid transactionId)
        {
            if (!await ValidateWalletOwnership(walletId))
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var existing = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (existing == null)
                return NotFound(ApiResponse.Fail("Transaction not found"));

            var dto = mapper.Map<TransactionDto>(existing);

            var deleted = await transactionRepository.DeleteAsync(transactionId);
            if (deleted == null)
                return NotFound(ApiResponse.Fail("Transaction not found"));

            return Ok(ApiResponse<TransactionDto>.Ok(dto, "Transaction deleted successfully"));
        }
    }
}
