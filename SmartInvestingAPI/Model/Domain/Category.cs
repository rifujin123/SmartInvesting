using System.ComponentModel.DataAnnotations;

namespace SmartInvestingAPI.Model.Domain
{
    public enum TransactionType
    {
        Income = 1,
        Expense = 2
    }
    public class Category : BaseAuditable
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TransactionType Type { get; set; }
        public string Icon { get; set; } = string.Empty;

        public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    }
}
