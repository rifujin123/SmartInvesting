using SmartInvestingAPI.Model.DTOs;

namespace SmartInvestingAPI.Services
{
    public interface IFireAntService
    {
        Task<decimal> GetCurrentPriceAsync(string symbol);
        Task<List<FireAntSymbolResponse>> GetSymbolsAsync(int limit, int offset = 0, CancellationToken cancellationToken = default);
        Task<List<FireAntSymbolResponse>> SearchSymbolsAsync(string keyword, int limit, int offset = 0, CancellationToken cancellationToken = default);
    }
}
