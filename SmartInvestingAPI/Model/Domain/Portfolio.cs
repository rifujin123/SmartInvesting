using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public class Portfolio : BaseAuditable
    {
        [Key]
        public Guid Id { get; set; }
        [Column(TypeName = "decimal(18, 4)")]
        public decimal TotalQuantity { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal AvgPrice { get; set; }

        public Guid UserId { get; set; }

        [ForeignKey("Asset")]
        public int AssetId { get; set; }
        public virtual Asset Asset { get; set; } = null!;

        public virtual ICollection<InvestmentOrder> InvestmentOrders { get; set; } = new List<InvestmentOrder>();
    }
}
