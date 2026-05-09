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
    [ApiController]
    [Authorize]
    public class IncomeEventsController : ControllerBase
    {
        private readonly IIncomeEventRepository incomeEventRepository;
        private readonly IWalletRepository walletRepository;
        private readonly IAssetRepository assetRepository;
        private readonly IMapper mapper;

        public IncomeEventsController(
            IIncomeEventRepository incomeEventRepository,
            IWalletRepository walletRepository,
            IAssetRepository assetRepository,
            IMapper mapper)
        {
            this.incomeEventRepository = incomeEventRepository;
            this.walletRepository = walletRepository;
            this.assetRepository = assetRepository;
            this.mapper = mapper;
        }

        private Guid? GetUserIdOrFail()
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(rawUserId, out var userId) ? userId : null;
        }

        private async Task<IActionResult> ValidateWalletOwnership(Guid walletId)
        {
            var userId = GetUserIdOrFail();
            if (userId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound(ApiResponse.Fail("Wallet not found"));

            return null!;
        }

        [HttpGet("/api/wallets/{walletId:Guid}/income-events")]
        public async Task<IActionResult> GetByWallet(
            [FromRoute] Guid walletId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] IncomeEventType? type)
        {
            var validation = await ValidateWalletOwnership(walletId);
            if (validation != null) return validation;

            var list = await incomeEventRepository.GetByWalletAsync(walletId, from, to, type);
            return Ok(ApiResponse<List<IncomeEventDto>>.Ok(mapper.Map<List<IncomeEventDto>>(list)));
        }

        [HttpGet("/api/wallets/{walletId:Guid}/income-events/{id:Guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid walletId, [FromRoute] Guid id)
        {
            var validation = await ValidateWalletOwnership(walletId);
            if (validation != null) return validation;

            var entity = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            if (entity == null)
                return NotFound(ApiResponse.Fail("Income event not found"));

            return Ok(ApiResponse<IncomeEventDto>.Ok(mapper.Map<IncomeEventDto>(entity)));
        }

        [HttpPost("/api/wallets/{walletId:Guid}/income-events")]
        public async Task<IActionResult> Create([FromRoute] Guid walletId, [FromBody] AddIncomeEventRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid income event data"));

            var validation = await ValidateWalletOwnership(walletId);
            if (validation != null) return validation;

            var userId = GetUserIdOrFail()!.Value;

            if (request.AssetId.HasValue)
            {
                var asset = await assetRepository.GetByIdAsync(request.AssetId.Value);
                if (asset == null)
                    return BadRequest(ApiResponse.Fail("Asset does not exist"));
            }

            var entity = new IncomeEvent
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                WalletId = walletId,
                AssetId = request.AssetId,
                Type = request.Type,
                Amount = request.Amount,
                EventDate = request.EventDate,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var created = await incomeEventRepository.CreateAsync(entity);
            var withNav = await incomeEventRepository.GetByIdAndWalletAsync(created.Id, walletId);
            var dto = withNav != null ? mapper.Map<IncomeEventDto>(withNav) : mapper.Map<IncomeEventDto>(created);
            return CreatedAtAction(nameof(GetById), new { walletId, id = created.Id },
                ApiResponse<IncomeEventDto>.Created(dto));
        }

        [HttpPut("/api/wallets/{walletId:Guid}/income-events/{id:Guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid walletId, [FromRoute] Guid id, [FromBody] UpdateIncomeEventRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid income event data"));

            var validation = await ValidateWalletOwnership(walletId);
            if (validation != null) return validation;

            var existing = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            if (existing == null || existing.UserId != GetUserIdOrFail())
                return NotFound(ApiResponse.Fail("Income event not found"));

            if (request.AssetId.HasValue)
            {
                var asset = await assetRepository.GetByIdAsync(request.AssetId.Value);
                if (asset == null)
                    return BadRequest(ApiResponse.Fail("Asset does not exist"));
            }

            existing.AssetId = request.AssetId;
            existing.Type = request.Type;
            existing.Amount = request.Amount;
            existing.EventDate = request.EventDate;
            existing.Note = request.Note;

            var updated = await incomeEventRepository.UpdateAsync(existing);
            if (updated == null)
                return NotFound(ApiResponse.Fail("Income event not found"));

            var reloaded = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            return Ok(ApiResponse<IncomeEventDto>.Ok(mapper.Map<IncomeEventDto>(reloaded)));
        }

        [HttpDelete("/api/wallets/{walletId:Guid}/income-events/{id:Guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid walletId, [FromRoute] Guid id)
        {
            var validation = await ValidateWalletOwnership(walletId);
            if (validation != null) return validation;

            var existing = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            if (existing == null || existing.UserId != GetUserIdOrFail())
                return NotFound(ApiResponse.Fail("Income event not found"));

            await incomeEventRepository.SoftDeleteAsync(id, walletId);
            return Ok(ApiResponse.Ok("Income event deleted successfully"));
        }
    }
}
