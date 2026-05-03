using System;
using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddTransactionRequestDto
    {
        [Required]
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax, ErrorMessage = "Amount must be equal or greater than 0")]
        public decimal Amount { get; set; }

        public string Note { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        public int? AssetId { get; set; }
    }
}

