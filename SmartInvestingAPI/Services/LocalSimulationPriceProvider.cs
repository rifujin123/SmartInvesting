using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    /// <summary>Dùng giá lưu trong DB (CurrentPrice) cho toàn bộ loại tài sản khi bật Simulation:UseLocalPrices.</summary>
    public class LocalSimulationPriceProvider : IMarketPriceProvider
    {
        public bool CanHandle(AssetType type) => true;

        public Task<decimal> GetCurrentPriceAsync(Asset asset)
            => Task.FromResult(asset.CurrentPrice);
    }
}
