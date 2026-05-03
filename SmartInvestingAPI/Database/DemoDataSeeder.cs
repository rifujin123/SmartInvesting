using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Database
{
    public static class DemoDataSeeder
    {
        public static async Task SeedDemoAssetsIfEmptyAsync(AppDbcontext db, CancellationToken cancellationToken = default)
        {
            if (await db.Assets.AnyAsync(cancellationToken))
                return;

            var utc = DateTime.UtcNow;
            var demo = new[]
            {
                new Asset
                {
                    Ticker = "VN30",
                    AssetName = "Quỹ chỉ số VN30 (demo)",
                    Type = AssetType.IndexFund,
                    CurrentPrice = 1850.50m,
                    CreatedAt = utc,
                    IsActive = true
                },
                new Asset
                {
                    Ticker = "E1VFVN30",
                    AssetName = "ETF E1VFVN30 (demo)",
                    Type = AssetType.ETF,
                    CurrentPrice = 120_000m,
                    CreatedAt = utc,
                    IsActive = true
                },
                new Asset
                {
                    Ticker = "VNM",
                    AssetName = "Vinamilk (demo)",
                    Type = AssetType.Stock,
                    CurrentPrice = 85_000m,
                    CreatedAt = utc,
                    IsActive = true
                }
            };

            await db.Assets.AddRangeAsync(demo, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
