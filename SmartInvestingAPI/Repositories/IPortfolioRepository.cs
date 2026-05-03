using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IPortfolioRepository
    {
        Task<List<Portfolio>> GetActivePortfoliosByUserAsync(Guid userId);
        Task<List<Portfolio>> GetPortfoliosByUserAndTypeAsync(Guid userId, int typeId);
        Task<Portfolio?> GetByUserAndAssetAsync(Guid userId, int assetId);
        Task<Portfolio> CreateAsync(Portfolio portfolio);
        Task<Portfolio> UpdateAsync(Portfolio portfolio);
    }
}
