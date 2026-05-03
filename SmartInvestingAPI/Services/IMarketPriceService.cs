using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public interface IMarketPriceService
    {
        Task<decimal> GetCurrentPriceAsync(Asset asset);
    }
}
