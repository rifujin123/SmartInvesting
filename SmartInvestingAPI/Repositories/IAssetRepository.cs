using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IAssetRepository
    {
        Task<List<Asset>> GetAllAsync();
        Task<Asset?> GetByIdAsync(int id);
        Task<Asset> CreateAsync(Asset asset);
        Task<Asset?> UpdateAsync(Asset asset);
        Task<Asset?> DeleteAsync(int id);
    }
}
