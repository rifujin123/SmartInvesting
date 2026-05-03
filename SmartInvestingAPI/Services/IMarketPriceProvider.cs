using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public interface IMarketPriceProvider
    {
        bool CanHandle(AssetType type);
        Task<decimal> GetCurrentPriceAsync(Asset asset);
    }
}

