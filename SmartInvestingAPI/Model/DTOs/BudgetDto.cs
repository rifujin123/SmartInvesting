using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class BudgetDto
    {
        public int Id { get; set; }
        public decimal AmountLimit { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public TransactionType CategoryType { get; set; }
    }
}

