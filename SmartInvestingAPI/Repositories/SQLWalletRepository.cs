using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLWalletRepository : IWalletRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLWalletRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }
        public async Task<Wallet> CreateAsync(Wallet wallet)
        {
            await dbContext.Wallets.AddAsync(wallet);
            await dbContext.SaveChangesAsync();
            return wallet;
        }

        public async Task<Wallet?> DeleteAsync(Guid id)
        {
            var wallet = await dbContext.Wallets.FirstOrDefaultAsync(x => x.Id == id);
            if (wallet == null)
                return null;
          
            wallet.IsActive = false;
            wallet.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            return wallet;
        }

        public async Task<List<Wallet>> GetAllByUserIdAsync(Guid userId)
        {
            return await dbContext.Wallets
                .AsNoTracking()
                .Where(x => x.UserId == userId && x.IsActive == true)
                .ToListAsync();
        }

        public async Task<(List<Wallet> Wallets, int TotalCount)> GetAllByUserIdAsync(Guid userId, int pageNumber, int pageSize)
        {
            var query = dbContext.Wallets
                .AsNoTracking()
                .Where(x => x.UserId == userId && x.IsActive == true);

            var totalCount = await query.CountAsync();
            var wallets = await query
                .OrderByDescending(w => w.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (wallets, totalCount);
        }

        public async Task<Wallet?> GetByIdAsync(Guid id)
        {
            return await dbContext.Wallets
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
