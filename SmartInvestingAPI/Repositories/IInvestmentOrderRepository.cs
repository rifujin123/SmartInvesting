using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface IInvestmentOrderRepository
    {
        Task<List<InvestmentOrder>> GetAllByUserAsync(Guid userId);
        Task<InvestmentOrder?> GetByIdAsync(Guid id, Guid userId);
    }
}
