using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLGoalRepository : IGoalRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLGoalRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<List<Goal>> GetAllByUserIdAsync(Guid userId)
        {
            return await dbContext.Goals
                .AsNoTracking()
                .Where(g => g.IsActive && g.UserId == userId)
                .ToListAsync();
        }

        public async Task<Goal?> GetByIdAndUserAsync(int id, Guid userId)
        {
            return await dbContext.Goals
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId && g.IsActive);
        }

        public async Task<Goal> CreateAsync(Goal goal)
        {
            await dbContext.Goals.AddAsync(goal);
            await dbContext.SaveChangesAsync();
            return goal;
        }

        public async Task<Goal?> UpdateAsync(Goal goal)
        {
            var existing = await dbContext.Goals.FirstOrDefaultAsync(
                g => g.Id == goal.Id && g.UserId == goal.UserId && g.IsActive);
            if (existing == null)
                return null;

            existing.Name = goal.Name;
            existing.TargetAmount = goal.TargetAmount;
            existing.CurrentAmount = goal.CurrentAmount;
            existing.Deadline = goal.Deadline;
            existing.Icon = goal.Icon;
            existing.Color = goal.Color;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<Goal?> DeleteAsync(int id, Guid userId)
        {
            var existing = await dbContext.Goals.FirstOrDefaultAsync(
                g => g.Id == id && g.UserId == userId && g.IsActive);
            if (existing == null)
                return null;

            existing.IsActive = false;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<Goal?> AddContributionAsync(int id, Guid userId, decimal amount)
        {
            var existing = await dbContext.Goals.FirstOrDefaultAsync(
                g => g.Id == id && g.UserId == userId && g.IsActive);
            if (existing == null)
                return null;

            existing.CurrentAmount += amount;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }
    }
}
