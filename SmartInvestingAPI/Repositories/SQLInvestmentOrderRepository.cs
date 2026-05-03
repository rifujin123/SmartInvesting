using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLInvestmentOrderRepository : IInvestmentOrderRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLInvestmentOrderRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<List<InvestmentOrder>> GetAllByUserAsync(Guid userId)
        {
            return await dbContext.InvestmentOrders
                .Include(o => o.Portfolio)
                    .ThenInclude(p => p.Asset)
                .Include(o => o.Wallet)
                .Where(o => o.Portfolio.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<InvestmentOrder?> GetByIdAsync(Guid id, Guid userId)
        {
            return await dbContext.InvestmentOrders
                .Include(o => o.Portfolio)
                    .ThenInclude(p => p.Asset)
                .Include(o => o.Wallet)
                .FirstOrDefaultAsync(o => o.Id == id && o.Portfolio.UserId == userId);
        }
    }
}
