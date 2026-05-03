using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;

namespace SmartInvestingAPI.Model.DTOs
{
    public class UpdateBudgetRequestDto
    {
        [Required]
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax,
            ErrorMessage = "AmountLimit must be equal or greater than 0")]
        public decimal AmountLimit { get; set; }

        [Range(1, 12)]
        public int Month { get; set; }

        [Range(2000, 2100)]
        public int Year { get; set; }

        [Required]
        public int CategoryId { get; set; }
    }
}

