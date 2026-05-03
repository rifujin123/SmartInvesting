using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddAssetRequestDto
    {
        [Required]
        [StringLength(20)]
        public string Ticker { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AssetName { get; set; } = string.Empty;

        [Required]
        public AssetType Type { get; set; }

        /// <summary>
        /// Giá tham chiếu nhập tay (tùy chọn). Nếu không gửi (null), hệ thống lấy giá từ FireAnt
        /// cho Stock / ETF / IndexFund. Vàng (Gold) và các loại chưa có provider phải gửi giá tay.
        /// </summary>
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.AssetPriceMax)]
        public decimal? CurrentPrice { get; set; }
    }
}
