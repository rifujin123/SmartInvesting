using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public class Wallet : BaseAuditable
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; } = 0;
        public string Currency { get; set; } = "VND";

        public Guid UserId { get; set; }

        /// <summary>Concurrency token để ngăn race condition khi cập nhật số dư.</summary>
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        /// <summary>Ví dùng cho mô phỏng / paper trading (phân biệt báo cáo, không đổi logic số dư).</summary>
        public bool IsPaper { get; set; }

        public virtual ICollection<InvestmentOrder> InvestmentOrders { get; set; } = new List<InvestmentOrder>();
        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
