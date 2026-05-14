using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace SmartInvestingAPI.Model.Domain
{
    public enum RiskTolerance
    {
        Conservative = 1,
        Moderate = 2,
        Aggressive = 3
    }
    public class User : IdentityUser<Guid>
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        public RiskTolerance RiskProfile { get; set; }
    }
}
