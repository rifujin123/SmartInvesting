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
        public DbSet<Asset> Assets { get; set; }
        public DbSet<AssetPricesHistory> AssetsPricesHistory { get; set; }
        public DbSet<IncomeEvent> IncomeEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Budget>(entity =>
            {
                entity.HasIndex(b => new { b.UserId, b.CategoryId, b.Month, b.Year })
                    .IsUnique();
            });

            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
