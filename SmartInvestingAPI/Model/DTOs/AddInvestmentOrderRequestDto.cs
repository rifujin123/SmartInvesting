using SmartInvestingAPI.Model.Domain;
using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddInvestmentOrderRequestDto
    {
        [Required]
        public Guid WalletId { get; set; }

        [Required]
        public int AssetId { get; set; }

        [Required]
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinPositive, SystemConstants.Validation.DecimalMax, ErrorMessage = "Quantity must be greater than 0")]
        public decimal Quantity { get; set; }

        [Required]
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax, ErrorMessage = "Price must be greater than or equal to 0")]
        public decimal Price { get; set; }

        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax, ErrorMessage = "Fee must be greater than or equal to 0")]
        public decimal Fee { get; set; }

        [Required]
        public OrderType OrderType { get; set; }
        public DateTime? OrderDate { get; set; }
    }
}
