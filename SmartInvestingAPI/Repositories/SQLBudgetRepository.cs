using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLBudgetRepository : IBudgetRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLBudgetRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<List<Budget>> GetAllByUserIdAsync(Guid userId)
        {
            return await dbContext.Budgets
                .Include(b => b.Category)
                .Where(b => b.IsActive && b.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Budget>> GetByUserMonthYearAsync(Guid userId, int month, int year)
        {
            return await dbContext.Budgets
                .Include(b => b.Category)
                .Where(b => b.IsActive && b.UserId == userId && b.Month == month && b.Year == year)
                .ToListAsync();
        }

        public async Task<Budget?> GetByIdAndUserAsync(int id, Guid userId)
        {
            return await dbContext.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId && b.IsActive);
        }

        public async Task<Budget> CreateAsync(Budget budget)
        {
            await dbContext.Budgets.AddAsync(budget);
            await dbContext.SaveChangesAsync();
            return budget;
        }

        public async Task<Budget?> UpdateAsync(Budget budget)
        {
            var existing = await dbContext.Budgets.FirstOrDefaultAsync(
                b => b.Id == budget.Id && b.UserId == budget.UserId && b.IsActive);
            if (existing == null)
                return null;

            existing.AmountLimit = budget.AmountLimit;
            existing.Month = budget.Month;
            existing.Year = budget.Year;
            existing.CategoryId = budget.CategoryId;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<Budget?> DeleteAsync(int id, Guid userId)
        {
            var existing = await dbContext.Budgets.FirstOrDefaultAsync(
                b => b.Id == id && b.UserId == userId && b.IsActive);
            if (existing == null)
                return null;

            existing.IsActive = false;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }
    }
}
