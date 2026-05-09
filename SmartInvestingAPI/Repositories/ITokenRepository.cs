using Microsoft.AspNetCore.Identity;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface ITokenRepository
    {
        (string Token, DateTime ExpiresAt) CreateToken(IdentityUser<Guid> user, List<string> roles);
        RefreshToken CreateRefreshToken(Guid userId, string? deviceInfo = null);
    }
}
