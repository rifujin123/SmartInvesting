using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IWalletRepository
    {
        public Task<List<Wallet>> GetAllByUserIdAsync(Guid userId);
        public Task<Wallet?> GetByIdAsync(Guid id);
        public Task<Wallet> CreateAsync(Wallet wallet);
        public Task<Wallet?> DeleteAsync(Guid id);

    }
}
