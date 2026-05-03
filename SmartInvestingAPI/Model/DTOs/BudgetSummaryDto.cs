using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class BudgetSummaryDto
    {
        public int BudgetId { get; set; }
        public decimal AmountLimit { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public TransactionType CategoryType { get; set; }

        public decimal TotalSpent { get; set; }
        public decimal Remaining { get; set; }
    }
}
