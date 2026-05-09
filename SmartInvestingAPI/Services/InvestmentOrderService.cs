using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public class InvestmentOrderService : IInvestmentOrderService
    {
        private readonly AppDbcontext dbContext;

        public InvestmentOrderService(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<InvestmentOrder> BuyAsync(
            Guid userId,
            Guid walletId,
            int assetId,
            decimal quantity,
            decimal price,
            decimal fee,
            DateTime? orderDate = null)
        {
            ValidateOrderInputs(quantity, price, fee);

            await using var tx = await dbContext.Database.BeginTransactionAsync();

            var wallet = await dbContext.Wallets
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId && w.IsActive);
            if (wallet == null)
                throw new KeyNotFoundException("Wallet does not exist or does not belong to current user.");

            var originalRowVersion = wallet.RowVersion;
            var buyCost = quantity * price + fee;

            if (wallet.Balance < buyCost)
                throw new InvalidOperationException("Insufficient wallet balance.");

            var asset = await dbContext.Assets
                .FirstOrDefaultAsync(a => a.Id == assetId && a.IsActive);
            if (asset == null)
                throw new InvalidOperationException("Asset does not exist.");

            var portfolio = await dbContext.Portfolios
                .FirstOrDefaultAsync(p => p.UserId == userId && p.AssetId == assetId && p.IsActive);

            if (portfolio == null)
            {
                portfolio = new Portfolio
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    AssetId = assetId,
                    TotalQuantity = quantity,
                    AvgPrice = buyCost / quantity,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await dbContext.Portfolios.AddAsync(portfolio);
            }
            else
            {
                var oldCost = portfolio.TotalQuantity * portfolio.AvgPrice;
                var newQuantity = portfolio.TotalQuantity + quantity;

                portfolio.TotalQuantity = newQuantity;
                portfolio.AvgPrice = (oldCost + buyCost) / newQuantity;
                portfolio.LastUpdated = DateTime.UtcNow;
            }

            var order = new InvestmentOrder
            {
                Id = Guid.NewGuid(),
                Quantity = quantity,
                Price = price,
                Fee = fee,
                RealizedProfitLoss = null,
                OrderType = OrderType.Buy,
                OrderDate = orderDate ?? DateTime.UtcNow,
                WalletId = walletId,
                PortfolioId = portfolio.Id
            };

            wallet.Balance -= buyCost;
            wallet.LastUpdated = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            // Verify RowVersion changed (concurrency check)
            if (originalRowVersion != null && wallet.RowVersion != null && 
                !wallet.RowVersion.SequenceEqual(originalRowVersion))
            {
                await tx.RollbackAsync();
                throw new DbUpdateConcurrencyException("Wallet balance was modified by another process. Please retry.");
            }

            await tx.CommitAsync();

            return order;
        }

        public async Task<InvestmentOrder> SellAsync(
            Guid userId,
            Guid walletId,
            int assetId,
            decimal quantity,
            decimal price,
            decimal fee,
            DateTime? orderDate = null)
        {
            ValidateOrderInputs(quantity, price, fee);

            await using var tx = await dbContext.Database.BeginTransactionAsync();

            var wallet = await dbContext.Wallets
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId && w.IsActive);
            if (wallet == null)
                throw new KeyNotFoundException("Wallet does not exist or does not belong to current user.");

            var originalRowVersion = wallet.RowVersion;

            var portfolio = await dbContext.Portfolios
                .FirstOrDefaultAsync(p => p.UserId == userId && p.AssetId == assetId && p.IsActive);
            if (portfolio == null)
                throw new KeyNotFoundException("Portfolio for this asset does not exist.");

            if (portfolio.TotalQuantity < quantity)
                throw new InvalidOperationException("Sell quantity exceeds current holding quantity.");

            var avgBeforeSell = portfolio.AvgPrice;
            var proceeds = quantity * price - fee;
            var costBasis = quantity * avgBeforeSell;
            var realizedProfitLoss = proceeds - costBasis;

            portfolio.TotalQuantity -= quantity;
            if (portfolio.TotalQuantity == 0)
            {
                portfolio.AvgPrice = 0;
            }
            portfolio.LastUpdated = DateTime.UtcNow;

            var order = new InvestmentOrder
            {
                Id = Guid.NewGuid(),
                Quantity = quantity,
                Price = price,
                Fee = fee,
                RealizedProfitLoss = realizedProfitLoss,
                OrderType = OrderType.Sell,
                OrderDate = orderDate ?? DateTime.UtcNow,
                WalletId = walletId,
                PortfolioId = portfolio.Id
            };

            wallet.Balance += proceeds;
            wallet.LastUpdated = DateTime.UtcNow;

            await dbContext.InvestmentOrders.AddAsync(order);
            await dbContext.SaveChangesAsync();

            // Verify RowVersion changed (concurrency check)
            if (originalRowVersion != null && wallet.RowVersion != null &&
                !wallet.RowVersion.SequenceEqual(originalRowVersion))
            {
                await tx.RollbackAsync();
                throw new DbUpdateConcurrencyException("Wallet balance was modified by another process. Please retry.");
            }

            await tx.CommitAsync();

            return order;
        }

        private static void ValidateOrderInputs(decimal quantity, decimal price, decimal fee)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.");
            if (price <= 0)
                throw new ArgumentException("Price must be greater than 0.");
            if (fee < 0)
                throw new ArgumentException("Fee cannot be negative.");
        }
    }
}
