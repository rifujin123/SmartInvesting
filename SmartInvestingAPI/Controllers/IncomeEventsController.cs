using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
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

        // GET: /api/wallets/{walletId}/income-events
        [HttpGet("/api/wallets/{walletId:Guid}/income-events")]
        public async Task<IActionResult> GetByWallet(
            [FromRoute] Guid walletId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] IncomeEventType? type)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var list = await incomeEventRepository.GetByWalletAsync(walletId, from, to, type);
            return Ok(mapper.Map<List<IncomeEventDto>>(list));
        }

        // GET: /api/wallets/{walletId}/income-events/{id}
        [HttpGet("/api/wallets/{walletId:Guid}/income-events/{id:Guid}")]
        public async Task<IActionResult> GetById([FromRoute] Guid walletId, [FromRoute] Guid id)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var entity = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            if (entity == null)
                return NotFound();

            return Ok(mapper.Map<IncomeEventDto>(entity));
        }

        // POST: /api/wallets/{walletId}/income-events
        [HttpPost("/api/wallets/{walletId:Guid}/income-events")]
        public async Task<IActionResult> Create([FromRoute] Guid walletId, [FromBody] AddIncomeEventRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            if (request.AssetId.HasValue)
            {
                var asset = await assetRepository.GetByIdAsync(request.AssetId.Value);
                if (asset == null)
                {
                    ModelState.AddModelError(nameof(request.AssetId), "Asset does not exist.");
                    return BadRequest(ModelState);
                }
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
            return CreatedAtAction(nameof(GetById), new { walletId, id = created.Id }, dto);
        }

        // PUT: /api/wallets/{walletId}/income-events/{id}
        [HttpPut("/api/wallets/{walletId:Guid}/income-events/{id:Guid}")]
        public async Task<IActionResult> Update([FromRoute] Guid walletId, [FromRoute] Guid id, [FromBody] UpdateIncomeEventRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var existing = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            if (existing == null || existing.UserId != userId)
                return NotFound();

            if (request.AssetId.HasValue)
            {
                var asset = await assetRepository.GetByIdAsync(request.AssetId.Value);
                if (asset == null)
                {
                    ModelState.AddModelError(nameof(request.AssetId), "Asset does not exist.");
                    return BadRequest(ModelState);
                }
            }

            existing.AssetId = request.AssetId;
            existing.Type = request.Type;
            existing.Amount = request.Amount;
            existing.EventDate = request.EventDate;
            existing.Note = request.Note;

            var updated = await incomeEventRepository.UpdateAsync(existing);
            if (updated == null)
                return NotFound();

            var reloaded = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            return Ok(mapper.Map<IncomeEventDto>(reloaded));
        }

        // DELETE: /api/wallets/{walletId}/income-events/{id}
        [HttpDelete("/api/wallets/{walletId:Guid}/income-events/{id:Guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid walletId, [FromRoute] Guid id)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var wallet = await walletRepository.GetByIdAsync(walletId);
            if (wallet == null || wallet.UserId != userId)
                return NotFound();

            var existing = await incomeEventRepository.GetByIdAndWalletAsync(id, walletId);
            if (existing == null || existing.UserId != userId)
                return NotFound();

            await incomeEventRepository.SoftDeleteAsync(id, walletId);
            return NoContent();
        }
    }
}
