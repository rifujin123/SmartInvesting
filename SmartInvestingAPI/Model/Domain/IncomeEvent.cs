using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public enum IncomeEventType
    {
        Dividend = 0,
        BondCoupon = 1,
        FundDistribution = 2,
        CashInterest = 3
    }

    public class IncomeEvent : BaseAuditable
    {
        [Key]
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        [ForeignKey(nameof(Wallet))]
        public Guid WalletId { get; set; }
        public virtual Wallet Wallet { get; set; } = null!;

        [ForeignKey(nameof(Asset))]
        public int? AssetId { get; set; }
        public virtual Asset? Asset { get; set; }

        public IncomeEventType Type { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        public DateTime EventDate { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }
}
