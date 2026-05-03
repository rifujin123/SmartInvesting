using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class UpdateAssetRequestDto
    {
        [Required]
        [StringLength(20)]
        public string Ticker { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AssetName { get; set; } = string.Empty;

        [Required]
        public AssetType Type { get; set; }

        [Required]
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.AssetPriceMax, ErrorMessage = "Current price must be equal or greater than 0")]
        public decimal CurrentPrice { get; set; }
    }
}
