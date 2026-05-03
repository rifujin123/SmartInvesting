using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public class FireAntMarketPriceProvider : IMarketPriceProvider
    {
        private readonly IFireAntService fireAntService;

        public FireAntMarketPriceProvider(IFireAntService fireAntService)
        {
            this.fireAntService = fireAntService;
        }

        public bool CanHandle(AssetType type)
        {
            // FireAnt hiện đang dùng cho nhóm mã chứng khoán/quỹ niêm yết.
            return type == AssetType.Stock
                   || type == AssetType.ETF
                   || type == AssetType.IndexFund;
        }

        public Task<decimal> GetCurrentPriceAsync(Asset asset)
        {
            if (string.IsNullOrWhiteSpace(asset.Ticker))
                throw new InvalidOperationException("Asset ticker is required to fetch market price.");

            return fireAntService.GetCurrentPriceAsync(asset.Ticker);
        }
    }
}

