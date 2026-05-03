using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public class MarketPriceService : IMarketPriceService
    {
        private readonly IEnumerable<IMarketPriceProvider> providers;

        public MarketPriceService(IEnumerable<IMarketPriceProvider> providers)
        {
            this.providers = providers;
        }

        public async Task<decimal> GetCurrentPriceAsync(Asset asset)
        {
            var provider = providers.FirstOrDefault(p => p.CanHandle(asset.Type));
            if (provider == null)
            {
                throw new InvalidOperationException(
                    $"No market price provider configured for AssetType '{asset.Type}'.");
            }

            return await provider.GetCurrentPriceAsync(asset);
        }
    }
}

