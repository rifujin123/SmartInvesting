using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public class Transaction : BaseAuditable
    {
        [Key]
        public Guid Id { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        public DateTime TransactionDate { get; set; }
        public string Note { get; set; } = string.Empty;

        [ForeignKey("Wallet")]
        public Guid WalletId { get; set; }
        public virtual Wallet Wallet { get; set; } = null!;

        [ForeignKey("Category")]
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;

        public int? AssetId { get; set; }
        public virtual Asset? Asset { get; set; }
    }
}
