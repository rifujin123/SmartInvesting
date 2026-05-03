using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
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

        public TransactionsController(IMapper mapper, ITransactionRepository transactionRepository, IWalletRepository walletRepository)
        {
            this.mapper = mapper;
            this.transactionRepository = transactionRepository;
            this.walletRepository = walletRepository;
        }

        // GET: /api/wallets/{walletId}/transactions
        [HttpGet("/api/wallets/{walletId:Guid}/transactions")]
        public async Task<IActionResult> GetAllByWallet([FromRoute] Guid walletId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var transactions = await transactionRepository.GetTransactionsByWalletIdAsync(walletId);
            return Ok(mapper.Map<List<TransactionDto>>(transactions));
        }

        // GET: /api/wallets/{walletId}/transactions/{transactionId}
        [HttpGet("/api/wallets/{walletId:Guid}/transactions/{transactionId:Guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid walletId, [FromRoute] Guid transactionId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var transaction = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (transaction == null)
                return NotFound();

            return Ok(mapper.Map<TransactionDto>(transaction));
        }

        // POST: /api/wallets/{walletId}/transactions
        [HttpPost("/api/wallets/{walletId:Guid}/transactions")]
        public async Task<IActionResult> Create([FromRoute] Guid walletId, [FromBody] AddTransactionRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var transaction = mapper.Map<Transaction>(request);
            transaction.WalletId = walletId;
            transaction.TransactionDate = DateTime.UtcNow;
            transaction.IsActive = true;

            var created = await transactionRepository.CreateAsync(transaction);

            var createdWithNav = await transactionRepository.GetTransactionByIdAndWalletIdAsync(created.Id, walletId);
            if (createdWithNav == null)
                return Problem(detail: "Transaction was created but could not be reloaded.", statusCode: StatusCodes.Status500InternalServerError);

            var dto = mapper.Map<TransactionDto>(createdWithNav);

            return CreatedAtAction(nameof(GetById), new { walletId, transactionId = dto.Id }, dto);
        }

        // PUT: /api/wallets/{walletId}/transactions/{transactionId}
        [HttpPut("/api/wallets/{walletId:Guid}/transactions/{transactionId:Guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid walletId, [FromRoute] Guid transactionId, [FromBody] UpdateTransactionRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var existing = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (existing == null)
                return NotFound();

            mapper.Map(request, existing);
            existing.Id = transactionId;
            existing.WalletId = walletId;

            var updated = await transactionRepository.UpdateAsync(existing);
            if (updated == null)
                return NotFound();

            var updatedWithNav = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (updatedWithNav == null)
                return NotFound();

            return Ok(mapper.Map<TransactionDto>(updatedWithNav));
        }

        // DELETE: /api/wallets/{walletId}/transactions/{transactionId}
        [HttpDelete("/api/wallets/{walletId:Guid}/transactions/{transactionId:Guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid walletId, [FromRoute] Guid transactionId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var existing = await transactionRepository.GetTransactionByIdAndWalletIdAsync(transactionId, walletId);
            if (existing == null)
                return NotFound();

            var dto = mapper.Map<TransactionDto>(existing);

            var deleted = await transactionRepository.DeleteAsync(transactionId);
            if (deleted == null)
                return NotFound();

            return Ok(dto);
        }
    }
}
