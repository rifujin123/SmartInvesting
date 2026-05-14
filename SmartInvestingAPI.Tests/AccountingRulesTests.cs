using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;
using SmartInvestingAPI.Repositories;
using SmartInvestingAPI.Services;

namespace SmartInvestingAPI.Tests;

public class AccountingRulesTests
{
    [Fact]
    public async Task BuyAsync_FirstBuy_UpdatesWalletPortfolioAndOrder()
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 1000m);
        var asset = CreateAsset(1, "AAA");

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        var order = await service.BuyAsync(userId, wallet.Id, asset.Id, 10m, 50m, 5m);

        var savedWallet = await db.Wallets.SingleAsync(w => w.Id == wallet.Id);
        var portfolio = await db.Portfolios.SingleAsync(p => p.UserId == userId && p.AssetId == asset.Id);
        var savedOrder = await db.InvestmentOrders.SingleAsync(o => o.Id == order.Id);

        Assert.Equal(495m, savedWallet.Balance);
        Assert.Equal(10m, portfolio.TotalQuantity);
        Assert.Equal(50.5m, portfolio.AvgPrice);
        Assert.Equal(OrderType.Buy, savedOrder.OrderType);
        Assert.Null(savedOrder.RealizedProfitLoss);
    }

    [Fact]
    public async Task BuyAsync_SecondBuy_RecalculatesWeightedAverageIncludingFees()
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 5000m);
        var asset = CreateAsset(1, "AAA");
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AssetId = asset.Id,
            TotalQuantity = 10m,
            AvgPrice = 50.5m,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        db.Portfolios.Add(portfolio);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        await service.BuyAsync(userId, wallet.Id, asset.Id, 5m, 60m, 10m);

        var savedWallet = await db.Wallets.SingleAsync(w => w.Id == wallet.Id);
        var savedPortfolio = await db.Portfolios.SingleAsync(p => p.Id == portfolio.Id);

        Assert.Equal(4690m, savedWallet.Balance);
        Assert.Equal(15m, savedPortfolio.TotalQuantity);
        Assert.Equal(54.333333333333333333333333333m, savedPortfolio.AvgPrice);
    }

    [Fact]
    public async Task SellAsync_PartialSell_UpdatesWalletQuantityAndRealizedProfitLoss()
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 100m);
        var asset = CreateAsset(1, "AAA");
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AssetId = asset.Id,
            TotalQuantity = 10m,
            AvgPrice = 50.5m,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        db.Portfolios.Add(portfolio);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        var order = await service.SellAsync(userId, wallet.Id, asset.Id, 4m, 70m, 5m);

        var savedWallet = await db.Wallets.SingleAsync(w => w.Id == wallet.Id);
        var savedPortfolio = await db.Portfolios.SingleAsync(p => p.Id == portfolio.Id);
        var savedOrder = await db.InvestmentOrders.SingleAsync(o => o.Id == order.Id);

        Assert.Equal(375m, savedWallet.Balance);
        Assert.Equal(6m, savedPortfolio.TotalQuantity);
        Assert.Equal(50.5m, savedPortfolio.AvgPrice);
        Assert.Equal(73m, savedOrder.RealizedProfitLoss);
    }

    [Fact]
    public async Task SellAsync_FullSell_ResetsAverageCostToZero()
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 0m);
        var asset = CreateAsset(1, "AAA");
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AssetId = asset.Id,
            TotalQuantity = 10m,
            AvgPrice = 50.5m,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        db.Portfolios.Add(portfolio);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        await service.SellAsync(userId, wallet.Id, asset.Id, 10m, 55m, 5m);

        var savedPortfolio = await db.Portfolios.SingleAsync(p => p.Id == portfolio.Id);
        Assert.Equal(0m, savedPortfolio.TotalQuantity);
        Assert.Equal(0m, savedPortfolio.AvgPrice);
    }

    [Fact]
    public async Task BuyAsync_InsufficientCash_ThrowsAndPersistsNothing()
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 100m);
        var asset = CreateAsset(1, "AAA");

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.BuyAsync(userId, wallet.Id, asset.Id, 10m, 20m, 5m));
        Assert.Equal(100m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);
        Assert.Empty(await db.InvestmentOrders.ToListAsync());
        Assert.Empty(await db.Portfolios.ToListAsync());
    }

    [Fact]
    public async Task SellAsync_Oversell_ThrowsAndLeavesPortfolioUnchanged()
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 100m);
        var asset = CreateAsset(1, "AAA");
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AssetId = asset.Id,
            TotalQuantity = 3m,
            AvgPrice = 10m,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        db.Portfolios.Add(portfolio);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.SellAsync(userId, wallet.Id, asset.Id, 5m, 20m, 1m));

        var savedWallet = await db.Wallets.SingleAsync(w => w.Id == wallet.Id);
        var savedPortfolio = await db.Portfolios.SingleAsync(p => p.Id == portfolio.Id);
        Assert.Equal(100m, savedWallet.Balance);
        Assert.Equal(3m, savedPortfolio.TotalQuantity);
        Assert.Equal(10m, savedPortfolio.AvgPrice);
    }

    [Theory]
    [InlineData(0, 10, 0, "Quantity must be greater than 0.")]
    [InlineData(-1, 10, 0, "Quantity must be greater than 0.")]
    [InlineData(1, 0, 0, "Price must be greater than 0.")]
    [InlineData(1, -1, 0, "Price must be greater than 0.")]
    [InlineData(1, 10, -1, "Fee cannot be negative.")]
    public async Task BuyAsync_InvalidInputs_ThrowArgumentException(decimal quantity, decimal price, decimal fee, string expectedMessage)
    {
        await using var db = await CreateDbContextAsync();
        var userId = Guid.NewGuid();
        var wallet = CreateWallet(userId, balance: 1000m);
        var asset = CreateAsset(1, "AAA");

        db.Wallets.Add(wallet);
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var service = new InvestmentOrderService(db);

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.BuyAsync(userId, wallet.Id, asset.Id, quantity, price, fee));
        Assert.Equal(expectedMessage, ex.Message);
    }

    [Fact]
    public async Task IncomeEventRepository_AppliesCreateUpdateDeleteCashDeltas()
    {
        await using var db = await CreateDbContextAsync();
        var wallet = CreateWallet(Guid.NewGuid(), balance: 100m);
        db.Wallets.Add(wallet);
        await db.SaveChangesAsync();

        var repo = new SQLIncomeEventRepository(db);
        var income = new IncomeEvent
        {
            Id = Guid.NewGuid(),
            UserId = wallet.UserId,
            WalletId = wallet.Id,
            Type = IncomeEventType.Dividend,
            Amount = 50m,
            EventDate = DateTime.UtcNow,
            IsActive = true
        };

        await repo.CreateAsync(income);
        Assert.Equal(150m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);

        var updatedIncome = new IncomeEvent
        {
            Id = income.Id,
            UserId = wallet.UserId,
            WalletId = wallet.Id,
            Type = income.Type,
            Amount = 80m,
            EventDate = income.EventDate,
            Note = income.Note,
            IsActive = true
        };

        await repo.UpdateAsync(updatedIncome);
        Assert.Equal(180m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);

        await repo.SoftDeleteAsync(income.Id, wallet.Id);
        Assert.Equal(100m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);
    }

    [Fact]
    public async Task TransactionRepository_AppliesCreateUpdateDeleteAndRetypeCashDeltas()
    {
        await using var db = await CreateDbContextAsync();
        var wallet = CreateWallet(Guid.NewGuid(), balance: 100m);
        var incomeCategory = CreateCategory(1, TransactionType.Income);
        var expenseCategory = CreateCategory(2, TransactionType.Expense);

        db.Wallets.Add(wallet);
        db.Categories.AddRange(incomeCategory, expenseCategory);
        await db.SaveChangesAsync();

        var repo = new SQLTransactionRepository(db);
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            CategoryId = expenseCategory.Id,
            Amount = 25m,
            TransactionDate = DateTime.UtcNow,
            Note = "expense",
            IsActive = true
        };

        await repo.CreateAsync(transaction);
        Assert.Equal(75m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);

        var updatedTransaction = new Transaction
        {
            Id = transaction.Id,
            WalletId = wallet.Id,
            CategoryId = incomeCategory.Id,
            Amount = 10m,
            TransactionDate = transaction.TransactionDate,
            Note = "income",
            IsActive = true
        };

        await repo.UpdateAsync(updatedTransaction);
        Assert.Equal(110m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);

        await repo.DeleteAsync(transaction.Id);
        Assert.Equal(100m, (await db.Wallets.SingleAsync(w => w.Id == wallet.Id)).Balance);
    }

    private static async Task<AppDbcontext> CreateDbContextAsync()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbcontext>()
            .UseSqlite(connection)
            .Options;

        var db = new AppDbcontext(options);
        await db.Database.EnsureCreatedAsync();
        return db;
    }

    private static Wallet CreateWallet(Guid userId, decimal balance) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Name = "Wallet",
        Balance = balance,
        Currency = "VND",
        CreatedAt = DateTime.UtcNow,
        IsActive = true
    };

    private static Asset CreateAsset(int id, string ticker) => new()
    {
        Id = id,
        Ticker = ticker,
        AssetName = ticker,
        Type = AssetType.Stock,
        CurrentPrice = 0m,
        CreatedAt = DateTime.UtcNow,
        IsActive = true
    };

    private static Category CreateCategory(int id, TransactionType type) => new()
    {
        Id = id,
        Name = type.ToString(),
        Type = type,
        Icon = string.Empty,
        CreatedAt = DateTime.UtcNow,
        IsActive = true
    };
}
