using System.ComponentModel.DataAnnotations;

namespace SmartInvestingAPI.Model.DTOs
{
    public class UpdateProfileRequestDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [Required]
        [MaxLength(256)]
        public string UserName { get; set; } = string.Empty;

        [MaxLength(500)]
        [Url]
        public string? AvatarUrl { get; set; }
    }
}
