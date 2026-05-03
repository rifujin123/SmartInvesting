using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Configuration;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddIncomeEventRequestDto
    {
        public int? AssetId { get; set; }

        [Required]
        public IncomeEventType Type { get; set; }

        [Required]
        [Range(typeof(decimal), SystemConstants.Validation.DecimalMinPositive, SystemConstants.Validation.DecimalMax)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime EventDate { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }
}
