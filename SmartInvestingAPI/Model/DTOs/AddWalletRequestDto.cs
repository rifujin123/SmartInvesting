using System.ComponentModel.DataAnnotations;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AddWalletRequestDto
    {
        [Required(ErrorMessage = "Name is missing")]
        public string Name { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Balance must be positive")]
        public decimal Balance { get; set; } = 0;

        [StringLength(10, ErrorMessage = "Invalid Currency")]
        public string Currency { get; set; } = "VND";

        public bool IsPaper { get; set; }
    }
}
