using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLPortfolioRepository : IPortfolioRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLPortfolioRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<List<Portfolio>> GetActivePortfoliosByUserAsync(Guid userId)
        {
            return await dbContext.Portfolios
                .AsNoTracking()
                .Include(p => p.Asset)
                .Where(p => p.UserId == userId && p.IsActive && p.TotalQuantity > 0)
                .ToListAsync();
        }

        public async Task<List<Portfolio>> GetPortfoliosByUserAndTypeAsync(Guid userId, int typeId)
        {
            return await dbContext.Portfolios
                .AsNoTracking()
                .Include(p=>p.Asset)
                .Where(x => x.UserId == userId
                        && x.Asset.Type == (AssetType)typeId
                        && x.IsActive == true)
                .ToListAsync();
        }

        public async Task<Portfolio?> GetByUserAndAssetAsync(Guid userId, int assetId)
        {
            return await dbContext.Portfolios
                .AsNoTracking()
                .Include(p => p.Asset)
                .FirstOrDefaultAsync(p => p.UserId == userId
                                          && p.AssetId == assetId
                                          && p.IsActive);
        }

        public async Task<Portfolio> CreateAsync(Portfolio portfolio)
        {
            await dbContext.Portfolios.AddAsync(portfolio);
            await dbContext.SaveChangesAsync();
            return portfolio;
        }

        public async Task<Portfolio> UpdateAsync(Portfolio portfolio)
        {
            var existing = await dbContext.Portfolios
                .FirstOrDefaultAsync(p => p.Id == portfolio.Id && p.IsActive);
            if (existing == null)
                throw new InvalidOperationException("Portfolio not found.");

            existing.TotalQuantity = portfolio.TotalQuantity;
            existing.AvgPrice = portfolio.AvgPrice;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }
    }
}
