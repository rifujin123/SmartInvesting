using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddGoalContributionRequestDto
    {
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinNonNegative, SystemConstants.Validation.DecimalMax,
            ErrorMessage = "Amount must be equal or greater than 0")]
        public decimal Amount { get; set; }
    }
}
