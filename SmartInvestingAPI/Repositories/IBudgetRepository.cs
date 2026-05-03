using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Model.DTOs;

namespace SmartInvestingAPI.Repositories
{
    public interface IBudgetRepository
    {
        Task<List<Budget>> GetAllByUserIdAsync(Guid userId);
        Task<List<Budget>> GetByUserMonthYearAsync(Guid userId, int month, int year);
        Task<Budget?> GetByIdAndUserAsync(int id, Guid userId);
        Task<Budget> CreateAsync(Budget budget);
        Task<Budget?> UpdateAsync(Budget budget);
        Task<Budget?> DeleteAsync(int id, Guid userId);
    }
}

