using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    /// <summary>Fallback khi không gọi FireAnt: vàng và mã không có nguồn ngoài — dùng CurrentPrice trong DB.</summary>
    public class DbStoredPriceMarketPriceProvider : IMarketPriceProvider
    {
        public bool CanHandle(AssetType type) => type == AssetType.Gold;

        public Task<decimal> GetCurrentPriceAsync(Asset asset)
            => Task.FromResult(asset.CurrentPrice);
    }
}
