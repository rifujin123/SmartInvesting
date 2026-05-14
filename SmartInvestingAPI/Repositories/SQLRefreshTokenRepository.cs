using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLRefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLRefreshTokenRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            var now = DateTime.UtcNow;
            return await dbContext.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked && rt.ExpiresAt > now);
        }

        public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
        {
            await dbContext.RefreshTokens.AddAsync(refreshToken);
            await dbContext.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<bool> RevokeAsync(string token)
        {
            var refreshToken = await dbContext.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token);

            if (refreshToken == null)
                return false;

            refreshToken.IsRevoked = true;
            refreshToken.RevokedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task RevokeAllByUserIdAsync(Guid userId)
        {
            var tokens = await dbContext.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            await dbContext.SaveChangesAsync();
        }

        public async Task<int> CleanupExpiredTokensAsync()
        {
            var expiredTokens = await dbContext.RefreshTokens
                .Where(rt => rt.ExpiresAt < DateTime.UtcNow || rt.IsRevoked)
                .ToListAsync();

            dbContext.RefreshTokens.RemoveRange(expiredTokens);
            await dbContext.SaveChangesAsync();
            return expiredTokens.Count;
        }
    }
}
