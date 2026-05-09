using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;
using SmartInvestingAPI.Model.Wrappers;
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

        [HttpGet("types/{typeId:int}")]
        public async Task<IActionResult> GetAllByType([FromRoute] int typeId, [FromQuery] bool refreshMarketPrice = false)
        {
            if (!Enum.IsDefined(typeof(AssetType), typeId))
                return BadRequest(ApiResponse.Fail("Asset type does not exist"));

            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (rawUserId == null)
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var userId = Guid.Parse(rawUserId);
            var portfolios = await portfolioRepository.GetPortfoliosByUserAndTypeAsync(userId, typeId);

            if (refreshMarketPrice && portfolios.Count > 0)
            {
                // Batch lookup: group portfolios by ticker to avoid N+1
                var portfoliosByTicker = portfolios
                    .Where(p => p.Asset?.Ticker != null)
                    .GroupBy(p => p.Asset!.Ticker!, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(g => g.Key, g => g.ToList(), StringComparer.OrdinalIgnoreCase);

                var distinctTickers = portfoliosByTicker.Keys.ToList();

                var tasks = distinctTickers.Select(async ticker =>
                {
                    var asset = portfoliosByTicker[ticker].First().Asset!;
                    var price = await marketPriceService.GetCurrentPriceAsync(asset);
                    return (ticker, price);
                });

                var results = await Task.WhenAll(tasks);
                var priceByTicker = results.ToDictionary(x => x.ticker, x => x.price, StringComparer.OrdinalIgnoreCase);

                foreach (var tickerGroup in portfoliosByTicker)
                {
                    if (priceByTicker.TryGetValue(tickerGroup.Key, out var latestPrice))
                    {
                        foreach (var p in tickerGroup.Value)
                        {
                            if (p.Asset != null)
                                p.Asset.CurrentPrice = latestPrice;
                        }
                    }
                }
            }

            var dto = mapper.Map<List<PortfolioDto>>(portfolios);
            return Ok(ApiResponse<List<PortfolioDto>>.Ok(dto));
        }
    }
}
