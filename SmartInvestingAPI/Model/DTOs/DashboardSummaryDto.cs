namespace SmartInvestingAPI.Model.DTOs
{
    public class DashboardSummaryDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalCashBalance { get; set; }
        public decimal PortfolioNav { get; set; }
        public decimal PortfolioInvestment { get; set; }
        public decimal PortfolioProfitLoss { get; set; }
        public decimal PortfolioProfitLossPercent { get; set; }
        public decimal TotalWealth { get; set; }
        public decimal TotalExpenseThisMonth { get; set; }
        public List<DashboardWalletRowDto> Wallets { get; set; } = new();
        public List<DashboardBudgetRowDto> Budgets { get; set; } = new();
    }

    public class DashboardWalletRowDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Currency { get; set; } = "VND";
        public bool IsPaper { get; set; }
    }

    public class DashboardBudgetRowDto
    {
        public int BudgetId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal AmountLimit { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal Remaining { get; set; }
    }
}
