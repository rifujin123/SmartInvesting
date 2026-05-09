using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Repositories;
using SmartInvestingAPI.Model.Wrappers;
using SmartInvestingAPI.Services;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssetsController : ControllerBase
    {
        private readonly IAssetRepository assetRepository;
        private readonly IMapper mapper;
        private readonly IMarketPriceService marketPriceService;

        public AssetsController(IAssetRepository assetRepository, IMapper mapper, IMarketPriceService marketPriceService)
        {
            this.assetRepository = assetRepository;
            this.mapper = mapper;
            this.marketPriceService = marketPriceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAssets()
        {
            var assets = await assetRepository.GetAllAsync();
            return Ok(ApiResponse<List<AssetDto>>.Ok(mapper.Map<List<AssetDto>>(assets)));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var asset = await assetRepository.GetByIdAsync(id);
            if (asset == null)
                return NotFound(ApiResponse.Fail("Asset not found"));

            return Ok(ApiResponse<AssetDto>.Ok(mapper.Map<AssetDto>(asset)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddAssetRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid asset data"));

            var asset = mapper.Map<Asset>(request);
            asset.CreatedAt = DateTime.UtcNow;
            asset.IsActive = true;

            if (request.CurrentPrice.HasValue)
            {
                asset.CurrentPrice = request.CurrentPrice.Value;
            }
            else
            {
                try
                {
                    var marketPrice = await marketPriceService.GetCurrentPriceAsync(asset);
                    if (marketPrice <= 0)
                        return BadRequest(ApiResponse.Fail("FireAnt does not return valid price for this ticker. Enter CurrentPrice manually or check the ticker."));
                    asset.CurrentPrice = marketPrice;
                }
                catch (Exception ex)
                {
                    return BadRequest(ApiResponse.Fail($"Cannot get reference price from FireAnt: {ex.Message}"));
                }
            }

            var created = await assetRepository.CreateAsync(asset);

            return CreatedAtAction(nameof(GetById), new { id = created.Id },
                ApiResponse<AssetDto>.Created(mapper.Map<AssetDto>(created)));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateAssetRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.Fail("Invalid asset data"));

            var asset = mapper.Map<Asset>(request);
            asset.Id = id;

            var updated = await assetRepository.UpdateAsync(asset);
            if (updated == null)
                return NotFound(ApiResponse.Fail("Asset not found"));

            return Ok(ApiResponse<AssetDto>.Ok(mapper.Map<AssetDto>(updated)));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var existing = await assetRepository.DeleteAsync(id);
            if (existing == null)
                return NotFound(ApiResponse.Fail("Asset not found"));

            return Ok(ApiResponse<AssetDto>.Ok(mapper.Map<AssetDto>(existing), "Asset deleted successfully"));
        }

        [HttpPost("market-prices/refresh")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefreshMarketPrices([FromQuery] int? typeId)
        {
            var assets = await assetRepository.GetAllAsync();
            if (typeId.HasValue)
                assets = assets.Where(a => (int)a.Type == typeId.Value).ToList();

            var result = new List<object>();
            var failures = new List<object>();

            foreach (var asset in assets)
            {
                var oldPrice = asset.CurrentPrice;
                decimal newPrice;
                try
                {
                    newPrice = await marketPriceService.GetCurrentPriceAsync(asset);
                }
                catch (Exception ex)
                {
                    failures.Add(new { asset.Ticker, error = ex.Message });
                    continue;
                }

                if (newPrice <= 0)
                {
                    failures.Add(new { asset.Ticker, error = "Invalid price returned (<= 0)." });
                    continue;
                }

                asset.CurrentPrice = newPrice;
                var updated = await assetRepository.UpdateAsync(asset);
                result.Add(new { asset.Id, asset.Ticker, OldPrice = oldPrice, NewPrice = updated?.CurrentPrice ?? newPrice });
            }

            return Ok(ApiResponse<object>.Ok(new { updated = result, failed = failures }));
        }
    }
}
