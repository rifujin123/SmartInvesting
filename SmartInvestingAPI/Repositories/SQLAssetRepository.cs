using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLAssetRepository : IAssetRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLAssetRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }
        public async Task<Asset> CreateAsync(Asset asset)
        {
            await dbContext.Assets.AddAsync(asset);
            await dbContext.SaveChangesAsync();
            return asset;
        }

        public async Task<Asset?> DeleteAsync(int id)
        {
            var existing = await dbContext.Assets.FirstOrDefaultAsync(a => a.Id == id && a.IsActive);
            if(existing == null)
                return null;
            
            existing.IsActive = false;
            existing.LastUpdated = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<List<Asset>> GetAllAsync()
        {
            return await dbContext.Assets.Where(a => a.IsActive).ToListAsync();
        }

        public async Task<Asset?> GetByIdAsync(int id)
        {
            return await dbContext.Assets.FirstOrDefaultAsync(a => a.Id == id && a.IsActive);
        }

        public async Task<Asset?> UpdateAsync(Asset asset)
        {
            var existing = await dbContext.Assets.FirstOrDefaultAsync(a => a.Id == asset.Id && a.IsActive);
            if(existing == null)
                return null;
            
            existing.AssetName = asset.AssetName;
            existing.Ticker = asset.Ticker;
            existing.Type = asset.Type;
            existing.CurrentPrice = asset.CurrentPrice;
            existing.LastUpdated = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
            return existing;
        }
    }
}
