using System.ComponentModel.DataAnnotations;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddCategoryRequestDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [StringLength(100)]
        public string Icon { get; set; } = string.Empty;
    }
}

