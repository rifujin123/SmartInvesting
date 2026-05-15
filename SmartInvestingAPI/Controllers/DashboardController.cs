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
                return Unauthorized(ApiResponse.Fail("Invalid user token"));

            var userId = Guid.Parse(rawUserId);
            var now = DateTime.UtcNow;
            var targetMonth = month ?? now.Month;
            var targetYear = year ?? now.Year;

            // Run independent queries in parallel
            var walletsTask = walletRepository.GetAllByUserIdAsync(userId);
            var portfoliosTask = portfolioRepository.GetActivePortfoliosByUserAsync(userId);
            var expenseTask = transactionRepository.GetTotalExpenseByUserForMonthAsync(userId, targetMonth, targetYear);
            var budgetsTask = budgetRepository.GetByUserMonthYearAsync(userId, targetMonth, targetYear);

            await Task.WhenAll(walletsTask, portfoliosTask, expenseTask, budgetsTask);

            var wallets = walletsTask.Result ?? new List<Wallet>();
            var portfolios = portfoliosTask.Result;
            var totalExpense = expenseTask.Result;
            var monthBudgets = budgetsTask.Result;

            var totalCash = wallets.Sum(w => w.Balance);

            // Refresh market prices if requested (parallel API calls)
            if (refreshMarketPrices && portfolios.Count > 0)
            {
                var tasks = portfolios.Select(async p =>
                {
                    var asset = p.Asset ?? throw new InvalidOperationException("Portfolio missing asset.");
                    var price = await marketPriceService.GetCurrentPriceAsync(asset);
                    return (portfolioId: p.Id, price);
                });
                var prices = await Task.WhenAll(tasks);
                var priceMap = prices.ToDictionary(x => x.portfolioId, x => x.price);
                foreach (var p in portfolios.Where(p => p.Asset != null))
                {
                    if (priceMap.TryGetValue(p.Id, out var latest))
                        p.Asset!.CurrentPrice = latest;
                }
            }

            var nav = portfolios
                .Where(p => p.Asset != null)
                .Sum(p => p.TotalQuantity * p.Asset!.CurrentPrice);

            var portfolioInvestment = portfolios
                .Where(p => p.Asset != null)
                .Sum(p => p.TotalQuantity * p.AvgPrice);

            var portfolioProfitLoss = nav - portfolioInvestment;
            var portfolioProfitLossPercent = portfolioInvestment == 0
                ? 0
                : (portfolioProfitLoss / portfolioInvestment) * 100;

            // FIX: Batch query to avoid N+1 - get all budget spending in one call
            var categoryIds = monthBudgets.Select(b => b.CategoryId).ToList();
            var spentByCategory = categoryIds.Any()
                ? await transactionRepository.GetTotalSpentByUserForCategoriesMonthAsync(userId, categoryIds, targetMonth, targetYear)
                : new Dictionary<int, decimal>();

            var budgetRows = monthBudgets.Select(b => new DashboardBudgetRowDto
            {
                BudgetId = b.Id,
                CategoryName = b.Category?.Name ?? string.Empty,
                AmountLimit = b.AmountLimit,
                TotalSpent = spentByCategory.TryGetValue(b.CategoryId, out var spent) ? spent : 0,
                Remaining = b.AmountLimit - (spentByCategory.TryGetValue(b.CategoryId, out spent) ? spent : 0)
            }).ToList();

            var dto = new DashboardSummaryDto
            {
                Year = targetYear,
                Month = targetMonth,
                TotalCashBalance = totalCash,
                PortfolioNav = nav,
                PortfolioInvestment = portfolioInvestment,
                PortfolioProfitLoss = portfolioProfitLoss,
                PortfolioProfitLossPercent = portfolioProfitLossPercent,
                TotalWealth = totalCash + nav,
                TotalExpenseThisMonth = totalExpense,
                Wallets = mapper.Map<List<DashboardWalletRowDto>>(wallets),
                Budgets = budgetRows
            };

            return Ok(ApiResponse<DashboardSummaryDto>.Ok(dto));
        }
    }
}
