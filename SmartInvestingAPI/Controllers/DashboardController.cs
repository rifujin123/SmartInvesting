using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
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
    public class DashboardController : ControllerBase
    {
        private readonly IWalletRepository walletRepository;
        private readonly IPortfolioRepository portfolioRepository;
        private readonly ITransactionRepository transactionRepository;
        private readonly IBudgetRepository budgetRepository;
        private readonly IMarketPriceService marketPriceService;
        private readonly IMapper mapper;

        public DashboardController(
            IWalletRepository walletRepository,
            IPortfolioRepository portfolioRepository,
            ITransactionRepository transactionRepository,
            IBudgetRepository budgetRepository,
            IMarketPriceService marketPriceService,
            IMapper mapper)
        {
            this.walletRepository = walletRepository;
            this.portfolioRepository = portfolioRepository;
            this.transactionRepository = transactionRepository;
            this.budgetRepository = budgetRepository;
            this.marketPriceService = marketPriceService;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetSummary(
            [FromQuery] int? month,
            [FromQuery] int? year,
            [FromQuery] bool refreshMarketPrices = false)
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (rawUserId == null)
                return Unauthorized();
            var userId = Guid.Parse(rawUserId);

            var now = DateTime.UtcNow;
            var m = month ?? now.Month;
            var y = year ?? now.Year;

            var wallets = await walletRepository.GetAllByUserIdAsync(userId);
            if (wallets == null)
                wallets = new List<Wallet>();

            var totalCash = wallets.Sum(w => w.Balance);

            var portfolios = await portfolioRepository.GetActivePortfoliosByUserAsync(userId);
            if (refreshMarketPrices && portfolios.Count > 0)
            {
                var tasks = portfolios.Select(async p =>
                {
                    var asset = p.Asset ?? throw new InvalidOperationException("Portfolio missing asset.");
                    var price = await marketPriceService.GetCurrentPriceAsync(asset);
                    return (portfolioId: p.Id, price);
                });
                var prices = await Task.WhenAll(tasks);
                var map = prices.ToDictionary(x => x.portfolioId, x => x.price);
                foreach (var p in portfolios)
                {
                    if (p.Asset != null && map.TryGetValue(p.Id, out var latest))
                        p.Asset.CurrentPrice = latest;
                }
            }

            decimal nav = 0;
            foreach (var p in portfolios)
            {
                if (p.Asset == null)
                    continue;
                nav += p.TotalQuantity * p.Asset.CurrentPrice;
            }

            var totalExpense = await transactionRepository.GetTotalExpenseByUserForMonthAsync(userId, m, y);

            var monthBudgets = await budgetRepository.GetByUserMonthYearAsync(userId, m, y);
            var budgetRows = new List<DashboardBudgetRowDto>();
            foreach (var b in monthBudgets)
            {
                var spent = await transactionRepository.GetTotalSpentByUserForCategoryMonthAsync(
                    userId,
                    b.CategoryId,
                    b.Month,
                    b.Year);
                budgetRows.Add(new DashboardBudgetRowDto
                {
                    BudgetId = b.Id,
                    CategoryName = b.Category?.Name ?? string.Empty,
                    AmountLimit = b.AmountLimit,
                    TotalSpent = spent,
                    Remaining = b.AmountLimit - spent
                });
            }

            var dto = new DashboardSummaryDto
            {
                Year = y,
                Month = m,
                TotalCashBalance = totalCash,
                PortfolioNav = nav,
                TotalWealth = totalCash + nav,
                TotalExpenseThisMonth = totalExpense,
                Wallets = mapper.Map<List<DashboardWalletRowDto>>(wallets),
                Budgets = budgetRows
            };

            return Ok(dto);
        }
    }
}
