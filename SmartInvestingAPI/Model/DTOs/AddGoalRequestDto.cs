using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddGoalRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax,
            ErrorMessage = "TargetAmount must be equal or greater than 0")]
        public decimal TargetAmount { get; set; }

        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax,
            ErrorMessage = "CurrentAmount must be equal or greater than 0")]
        public decimal CurrentAmount { get; set; }

        public DateTime? Deadline { get; set; }

        [MaxLength(50)]
        public string Icon { get; set; } = "flag";

        [MaxLength(20)]
        public string Color { get; set; } = "#DBEAFE";
    }
}
