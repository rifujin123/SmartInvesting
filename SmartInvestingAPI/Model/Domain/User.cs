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
        public RiskTolerance RiskProfile { get; set; }
    }
}
