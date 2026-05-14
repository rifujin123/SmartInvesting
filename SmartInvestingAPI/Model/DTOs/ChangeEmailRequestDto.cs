using System.ComponentModel.DataAnnotations;

namespace SmartInvestingAPI.Model.DTOs
{
    public class ChangeEmailRequestDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string NewEmail { get; set; } = string.Empty;
    }
}
