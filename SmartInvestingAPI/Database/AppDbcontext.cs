using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Model.Domain;
using System.Linq;

namespace SmartInvestingAPI.Database
{
    public class AppDbcontext : DbContext
    {
        public AppDbcontext(DbContextOptions<AppDbcontext> options):base(options)
        {
        }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Portfolio> Portfolios { get; set; }
        public DbSet<InvestmentOrder> InvestmentOrders { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<AssetPricesHistory> AssetsPricesHistory { get; set; }
        public DbSet<IncomeEvent> IncomeEvents { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Wallet>(entity =>
            {
                entity.Property(w => w.RowVersion)
                    .IsRowVersion()
                    .IsConcurrencyToken();
            });

            modelBuilder.Entity<Budget>(entity =>
            {
                entity.HasIndex(b => new { b.UserId, b.CategoryId, b.Month, b.Year })
                    .IsUnique();
            });

            modelBuilder.Entity<Goal>(entity =>
            {
                entity.HasIndex(g => g.UserId);
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasIndex(t => t.WalletId);
                entity.HasIndex(t => t.CategoryId);
                entity.HasIndex(t => t.TransactionDate);
                entity.HasIndex(t => new { t.WalletId, t.TransactionDate });
                entity.HasIndex(t => new { t.CategoryId, t.TransactionDate });
            });

            modelBuilder.Entity<Portfolio>(entity =>
            {
                entity.HasIndex(p => p.UserId);
                entity.HasIndex(p => p.AssetId);
                entity.HasIndex(p => new { p.UserId, p.AssetId });
            });

            modelBuilder.Entity<InvestmentOrder>(entity =>
            {
                entity.HasIndex(o => o.WalletId);
                entity.HasIndex(o => o.OrderDate);
                entity.HasIndex(o => new { o.WalletId, o.OrderDate });
            });

            modelBuilder.Entity<IncomeEvent>(entity =>
            {
                entity.HasIndex(e => e.WalletId);
                entity.HasIndex(e => e.EventDate);
                entity.HasIndex(e => new { e.WalletId, e.EventDate });
            });

            modelBuilder.Entity<AssetPricesHistory>(entity =>
            {
                entity.HasIndex(h => h.AssetId);
                entity.HasIndex(h => h.RecordedAt);
                entity.HasIndex(h => new { h.AssetId, h.RecordedAt });
            });

            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
