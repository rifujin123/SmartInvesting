using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface ITokenRepository
    {
        (string Token, DateTime ExpiresAt) CreateToken(User user, List<string> roles);
        RefreshToken CreateRefreshToken(Guid userId, string? deviceInfo = null);
    }
}
