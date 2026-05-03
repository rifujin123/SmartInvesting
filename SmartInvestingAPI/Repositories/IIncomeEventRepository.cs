using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IIncomeEventRepository
    {
        Task<List<IncomeEvent>> GetByWalletAsync(Guid walletId, DateTime? fromUtc, DateTime? toUtc, IncomeEventType? type);
        Task<IncomeEvent?> GetByIdAndWalletAsync(Guid id, Guid walletId);
        Task<IncomeEvent> CreateAsync(IncomeEvent entity);
        Task<IncomeEvent?> UpdateAsync(IncomeEvent entity);
        Task<IncomeEvent?> SoftDeleteAsync(Guid id, Guid walletId);
    }
}
