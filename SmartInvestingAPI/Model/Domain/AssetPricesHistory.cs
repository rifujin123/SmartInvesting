using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public class AssetPricesHistory : BaseAuditable
    {
        [Key]
        public long Id { get; set; }
        public int AssetId { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }
        public DateTime RecordedAt { get; set; }
    }
}
