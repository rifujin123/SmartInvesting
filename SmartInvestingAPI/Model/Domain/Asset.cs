using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public enum AssetType
    {
        IndexFund = 1,
        ETF = 2,
        Stock = 3,
        Gold = 4
    }
    public class Asset : BaseAuditable
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(20)]
        public string Ticker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public AssetType Type { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal CurrentPrice { get; set; }

        public virtual ICollection<Portfolio> Portfolio { get; set; } = new List<Portfolio>();
        public virtual ICollection<AssetPricesHistory> AssetPricesHistories { get; set; } = new List<AssetPricesHistory>();
    }
}
