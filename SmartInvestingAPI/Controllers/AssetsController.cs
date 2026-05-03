using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
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
        //GET: /api/assets
        [HttpGet]
        public async Task<IActionResult> GetAllAssets()
        {
            var assets = await assetRepository.GetAllAsync();
            return Ok(mapper.Map<List<AssetDto>>(assets));
        }

        //GET: /api/assets/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var asset = await assetRepository.GetByIdAsync(id);
            if (asset == null)
                return NotFound();

            return Ok(mapper.Map<AssetDto>(asset));
        }

        //POST: /api/assets
        [HttpPost]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] AddAssetRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
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
                        return BadRequest("FireAnt không trả giá hợp lệ cho mã này. Hãy nhập CurrentPrice thủ công hoặc kiểm tra ticker.");
                    asset.CurrentPrice = marketPrice;
                }
                catch (Exception ex)
                {
                    return BadRequest(new
                    {
                        message = "Không lấy được giá tham chiếu từ FireAnt (hoặc loại tài sản chưa dùng FireAnt — ví dụ Gold: cần nhập CurrentPrice).",
                        detail = ex.Message
                    });
                }
            }

            var created = await assetRepository.CreateAsync(asset);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, mapper.Map<AssetDto>(created));
        }

        //PUT: /api/assets/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateAssetRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var asset = mapper.Map<Asset>(request);
            asset.Id = id;

            var updated = await assetRepository.UpdateAsync(asset);
            if (updated == null)
                return NotFound();

            return Ok(mapper.Map<AssetDto>(updated));
        }

        //DELETE: /api/assets/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var existing = await assetRepository.DeleteAsync(id);
            if (existing == null)
                return NotFound();

            return Ok(mapper.Map<AssetDto>(existing));
        }

        // POST: api/assets/market-prices/refresh?typeId=1
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
                    failures.Add(new { asset.Ticker, error = "Giá trả về không hợp lệ (<= 0)." });
                    continue;
                }

                asset.CurrentPrice = newPrice;
                var updated = await assetRepository.UpdateAsync(asset);
                result.Add(new { asset.Id, asset.Ticker, OldPrice = oldPrice, NewPrice = updated?.CurrentPrice ?? newPrice });
            }

            return Ok(new { updated = result, failed = failures });
        }
    }
}
