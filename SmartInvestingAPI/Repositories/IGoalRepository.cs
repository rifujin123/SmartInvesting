using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IGoalRepository
    {
        Task<List<Goal>> GetAllByUserIdAsync(Guid userId);
        Task<Goal?> GetByIdAndUserAsync(int id, Guid userId);
        Task<Goal> CreateAsync(Goal goal);
        Task<Goal?> UpdateAsync(Goal goal);
        Task<Goal?> DeleteAsync(int id, Guid userId);
        Task<Goal?> AddContributionAsync(int id, Guid userId, decimal amount);
    }
}
