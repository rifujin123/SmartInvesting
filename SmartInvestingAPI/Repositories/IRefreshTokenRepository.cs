using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
        Task<bool> RevokeAsync(string token);
        Task RevokeAllByUserIdAsync(Guid userId);
        Task<int> CleanupExpiredTokensAsync();
    }
}
