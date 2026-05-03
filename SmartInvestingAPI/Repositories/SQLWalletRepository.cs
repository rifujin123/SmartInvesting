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
                .Where(x => x.UserId == userId && x.IsActive == true)
                .ToListAsync();
        }

        public async Task<Wallet?> GetByIdAsync(Guid id)
        {
            var wallet = await dbContext.Wallets.FirstOrDefaultAsync(x => x.Id == id);
            if (wallet == null)
                return null;
            return wallet;
        }
    }
}
