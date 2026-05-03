using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLIncomeEventRepository : IIncomeEventRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLIncomeEventRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<List<IncomeEvent>> GetByWalletAsync(Guid walletId, DateTime? fromUtc, DateTime? toUtc, IncomeEventType? type)
        {
            var q = dbContext.IncomeEvents
                .Include(e => e.Asset)
                .Where(e => e.WalletId == walletId && e.IsActive);

            if (fromUtc.HasValue)
                q = q.Where(e => e.EventDate >= fromUtc.Value);
            if (toUtc.HasValue)
                q = q.Where(e => e.EventDate <= toUtc.Value);
            if (type.HasValue)
                q = q.Where(e => e.Type == type.Value);

            return await q.OrderByDescending(e => e.EventDate).ToListAsync();
        }

        public async Task<IncomeEvent?> GetByIdAndWalletAsync(Guid id, Guid walletId)
        {
            return await dbContext.IncomeEvents
                .Include(e => e.Asset)
                .FirstOrDefaultAsync(e => e.Id == id && e.WalletId == walletId && e.IsActive);
        }

        public async Task<IncomeEvent> CreateAsync(IncomeEvent entity)
        {
            var wallet = await dbContext.Wallets
                .FirstOrDefaultAsync(w => w.Id == entity.WalletId && w.IsActive);
            if (wallet == null)
                throw new InvalidOperationException("Wallet not found or inactive.");

            await dbContext.IncomeEvents.AddAsync(entity);
            wallet.Balance += entity.Amount;
            wallet.LastUpdated = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
            return entity;
        }

        public async Task<IncomeEvent?> UpdateAsync(IncomeEvent entity)
        {
            var existing = await dbContext.IncomeEvents
                .FirstOrDefaultAsync(e => e.Id == entity.Id && e.WalletId == entity.WalletId && e.IsActive);
            if (existing == null)
                return null;

            var wallet = await dbContext.Wallets
                .FirstOrDefaultAsync(w => w.Id == existing.WalletId && w.IsActive);
            if (wallet == null)
                throw new InvalidOperationException("Wallet not found or inactive.");

            var oldAmount = existing.Amount;
            existing.AssetId = entity.AssetId;
            existing.Type = entity.Type;
            existing.Amount = entity.Amount;
            existing.EventDate = entity.EventDate;
            existing.Note = entity.Note;
            existing.LastUpdated = DateTime.UtcNow;

            wallet.Balance += entity.Amount - oldAmount;
            wallet.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<IncomeEvent?> SoftDeleteAsync(Guid id, Guid walletId)
        {
            var existing = await dbContext.IncomeEvents
                .FirstOrDefaultAsync(e => e.Id == id && e.WalletId == walletId && e.IsActive);
            if (existing == null)
                return null;

            var wallet = await dbContext.Wallets
                .FirstOrDefaultAsync(w => w.Id == existing.WalletId && w.IsActive);
            if (wallet != null)
            {
                wallet.Balance -= existing.Amount;
                wallet.LastUpdated = DateTime.UtcNow;
            }

            existing.IsActive = false;
            existing.LastUpdated = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
            return existing;
        }
    }
}
