using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public enum OrderType
    {
        Buy = 0,
        Sell = 1
    }
    public class InvestmentOrder
    {
        [Key]
        public Guid Id { get; set; }

        [Column(TypeName = "decimal(18, 4)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Fee { get; set; }

        /// <summary>
        /// Lãi/lỗ đã thực hiện (WAC) cho lệnh bán; null với lệnh mua.
        /// </summary>
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? RealizedProfitLoss { get; set; }

        public OrderType OrderType { get; set; }
        public DateTime OrderDate { get; set; }

        [ForeignKey("Portfolio")]
        public Guid PortfolioId { get; set; }
        public virtual Portfolio Portfolio { get; set; } = null!;

        [ForeignKey("Wallet")]
        public Guid WalletId { get; set; }
        public virtual Wallet Wallet { get; set; } = null!;
    }
}
