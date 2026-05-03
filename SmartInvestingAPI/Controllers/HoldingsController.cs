using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Repositories;
using SmartInvestingAPI.Services;

namespace SmartInvestingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HoldingsController : ControllerBase
    {
        private readonly IPortfolioRepository portfolioRepository;
        private readonly IMapper mapper;
        private readonly IMarketPriceService marketPriceService;

        public HoldingsController(IPortfolioRepository portfolioRepository, IMapper mapper, IMarketPriceService marketPriceService)
        {
            this.portfolioRepository = portfolioRepository;
            this.mapper = mapper;
            this.marketPriceService = marketPriceService;
        }

        //GET : /api/holdings/types/{id}
        [HttpGet("types/{typeId:int}")]
        public async Task<IActionResult> GetAllByType([FromRoute] int typeId, [FromQuery] bool refreshMarketPrice = false)
        {
            if (!Enum.IsDefined(typeof(AssetType), typeId))
                return BadRequest("Danh mục không tồn tại");

            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(rawUserId == null)
                return Unauthorized();
            var userId = Guid.Parse(rawUserId);

            var portfolios = await portfolioRepository.GetPortfoliosByUserAndTypeAsync(userId, typeId);

            if (refreshMarketPrice && portfolios.Count > 0)
            {
                var distinctTickers = portfolios
                    .Select(p => p.Asset?.Ticker)
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                // Nhiều call ra ngoài; chạy song song để giảm latency.
                var tasks = distinctTickers.Select(async ticker =>
                {
                    // Tick­er -> Asset mapping: lấy asset đầu tiên theo ticker từ portfolios (đã Include Asset).
                    var asset = portfolios.First(p => p.Asset != null && string.Equals(p.Asset.Ticker, ticker, StringComparison.OrdinalIgnoreCase)).Asset!;
                    var price = await marketPriceService.GetCurrentPriceAsync(asset);
                    return (ticker: ticker!, price);
                });

                var results = await Task.WhenAll(tasks);
                var priceByTicker = results.ToDictionary(x => x.ticker, x => x.price, StringComparer.OrdinalIgnoreCase);

                foreach (var p in portfolios)
                {
                    var ticker = p.Asset?.Ticker;
                    if (ticker != null && priceByTicker.TryGetValue(ticker, out var latest))
                    {
                        // Update in-memory để mapper trả CurrentPrice/P-L theo giá mới nhất.
                        if (p.Asset != null)
                            p.Asset.CurrentPrice = latest;
                    }
                }
            }

            var dto = mapper.Map<List<PortfolioDto>>(portfolios);
            return Ok(dto);
        }

    }
}
