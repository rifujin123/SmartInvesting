using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLCategoryRepository : ICategoryRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLCategoryRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<List<Category>> GetAllAsync()
        {
            return await dbContext.Categories
                .AsNoTracking()
                .Where(c => c.IsActive)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await dbContext.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<Category> CreateAsync(Category category)
        {
            await dbContext.Categories.AddAsync(category);
            await dbContext.SaveChangesAsync();
            return category;
        }

        public async Task<Category?> UpdateAsync(Category category)
        {
            var existing = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == category.Id && c.IsActive);
            if (existing == null)
                return null;

            existing.Name = category.Name;
            existing.Type = category.Type;
            existing.Icon = category.Icon;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<Category?> DeleteAsync(int id)
        {
            var existing = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
            if (existing == null)
                return null;

            existing.IsActive = false;
            existing.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();
            return existing;
        }
    }
}

