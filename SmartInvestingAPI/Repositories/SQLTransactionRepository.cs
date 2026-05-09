using Microsoft.EntityFrameworkCore;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public class SQLTransactionRepository : ITransactionRepository
    {
        private readonly AppDbcontext dbContext;

        public SQLTransactionRepository(AppDbcontext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<Transaction> CreateAsync(Transaction transaction)
        {
            await using var tx = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var category = await dbContext.Categories
                    .FirstOrDefaultAsync(c => c.Id == transaction.CategoryId && c.IsActive);
                if (category == null)
                    throw new InvalidOperationException("Category not found or inactive.");

                var wallet = await dbContext.Wallets
                    .FirstOrDefaultAsync(w => w.Id == transaction.WalletId && w.IsActive);
                if (wallet == null)
                    throw new InvalidOperationException("Wallet not found or inactive.");

                await dbContext.Transactions.AddAsync(transaction);
                ApplyTransactionToBalance(wallet, category.Type, transaction.Amount);
                await dbContext.SaveChangesAsync();
                await tx.CommitAsync();
                return transaction;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<List<Transaction>> GetAllAsync()
        {
            return await dbContext.Transactions
                .AsNoTracking()
                .Include(t => t.Category)
                .Include(t => t.Asset)
                .ToListAsync();
        }

        public async Task<List<Transaction>> GetTransactionsByWalletIdAsync(Guid walletId)
        {
            return await dbContext.Transactions
                .AsNoTracking()
                .Include(t => t.Category)
                .Include(t => t.Asset)
                .Where(t => t.WalletId == walletId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<(List<Transaction> Transactions, int TotalCount)> GetTransactionsByWalletIdAsync(Guid walletId, int pageNumber, int pageSize)
        {
            var query = dbContext.Transactions
                .AsNoTracking()
                .Include(t => t.Category)
                .Include(t => t.Asset)
                .Where(t => t.WalletId == walletId);

            var totalCount = await query.CountAsync();
            var transactions = await query
                .OrderByDescending(t => t.TransactionDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (transactions, totalCount);
        }

        public async Task<Transaction?> GetByIdAsync(Guid transactionId)
        {
            return await dbContext.Transactions
                .AsNoTracking()
                .Include(t => t.Category)
                .Include(t => t.Asset)
                .FirstOrDefaultAsync(t => t.Id == transactionId);
        }

        public async Task<Transaction?> GetTransactionByIdAndWalletIdAsync(Guid transactionId, Guid walletId)
        {
            return await dbContext.Transactions
                .AsNoTracking()
                .Include(t => t.Category)
                .Include(t => t.Asset)
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.WalletId == walletId);
        }

        public async Task<Transaction?> UpdateAsync(Transaction transaction)
        {
            await using var tx = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var existing = await dbContext.Transactions
                    .FirstOrDefaultAsync(t => t.Id == transaction.Id);
                if (existing == null)
                    return null;

                var newCategory = await dbContext.Categories
                    .FirstOrDefaultAsync(c => c.Id == transaction.CategoryId && c.IsActive);
                if (newCategory == null)
                    throw new InvalidOperationException("Category not found or inactive.");

                var oldCategory = existing.Category
                    ?? await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == existing.CategoryId);
                if (oldCategory == null)
                    throw new InvalidOperationException("Original category not found.");

                var oldDelta = TransactionBalanceDelta(oldCategory.Type, existing.Amount);
                var newDelta = TransactionBalanceDelta(newCategory.Type, transaction.Amount);

                if (existing.WalletId != transaction.WalletId)
                {
                    var oldWallet = await dbContext.Wallets
                        .FirstOrDefaultAsync(w => w.Id == existing.WalletId && w.IsActive);
                    var newWallet = await dbContext.Wallets
                        .FirstOrDefaultAsync(w => w.Id == transaction.WalletId && w.IsActive);
                    if (oldWallet == null || newWallet == null)
                        throw new InvalidOperationException("Wallet not found or inactive.");

                    ApplyBalanceDelta(oldWallet, -oldDelta);
                    ApplyBalanceDelta(newWallet, newDelta);
                }
                else
                {
                    var wallet = await dbContext.Wallets
                        .FirstOrDefaultAsync(w => w.Id == existing.WalletId && w.IsActive);
                    if (wallet == null)
                        throw new InvalidOperationException("Wallet not found or inactive.");

                    ApplyBalanceDelta(wallet, newDelta - oldDelta);
                }

                existing.Amount = transaction.Amount;
                existing.TransactionDate = transaction.TransactionDate;
                existing.Note = transaction.Note;
                existing.WalletId = transaction.WalletId;
                existing.CategoryId = transaction.CategoryId;
                existing.AssetId = transaction.AssetId;
                existing.LastUpdated = DateTime.UtcNow;

                await dbContext.SaveChangesAsync();
                await tx.CommitAsync();
                return existing;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<Transaction?> DeleteAsync(Guid transactionId)
        {
            await using var tx = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var existing = await dbContext.Transactions
                    .Include(t => t.Category)
                    .FirstOrDefaultAsync(t => t.Id == transactionId);
                if (existing == null)
                    return null;

                var wallet = await dbContext.Wallets
                    .FirstOrDefaultAsync(w => w.Id == existing.WalletId && w.IsActive);
                if (wallet != null)
                {
                    var oldCategory = existing.Category
                        ?? await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == existing.CategoryId);
                    if (oldCategory != null)
                    {
                        var applied = TransactionBalanceDelta(oldCategory.Type, existing.Amount);
                        ApplyBalanceDelta(wallet, -applied);
                    }
                }

                dbContext.Transactions.Remove(existing);
                await dbContext.SaveChangesAsync();
                await tx.CommitAsync();
                return existing;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<decimal> GetTotalSpentAsync(int categoryId, int month, int year)
        {
            var totalSpent = await dbContext.Transactions
                .Where(t => t.CategoryId == categoryId
                            && t.TransactionDate.Month == month
                            && t.TransactionDate.Year == year
                            && t.IsActive)
                .SumAsync(t => t.Amount);

            return totalSpent;
        }

        public async Task<decimal> GetTotalSpentByUserForCategoryMonthAsync(
            Guid userId,
            int categoryId,
            int month,
            int year)
        {
            return await dbContext.Transactions
                .Where(t => t.IsActive
                            && t.TransactionDate.Month == month
                            && t.TransactionDate.Year == year
                            && t.CategoryId == categoryId
                            && t.Category.Type == TransactionType.Expense
                            && t.Wallet.UserId == userId)
                .SumAsync(t => t.Amount);
        }

        public async Task<decimal> GetTotalExpenseByUserForMonthAsync(Guid userId, int month, int year)
        {
            return await dbContext.Transactions
                .Where(t => t.IsActive
                            && t.TransactionDate.Month == month
                            && t.TransactionDate.Year == year
                            && t.Category.Type == TransactionType.Expense
                            && t.Wallet.UserId == userId)
                .SumAsync(t => t.Amount);
        }

        /// <summary>
        /// Batch query để lấy tổng chi theo nhiều categories cùng lúc — tránh N+1 problem.
        /// </summary>
        public async Task<Dictionary<int, decimal>> GetTotalSpentByUserForCategoriesMonthAsync(
            Guid userId,
            IEnumerable<int> categoryIds,
            int month,
            int year)
        {
            var categoryIdList = categoryIds.ToList();
            if (!categoryIdList.Any())
                return new Dictionary<int, decimal>();

            var results = await dbContext.Transactions
                .Where(t => t.IsActive
                            && t.TransactionDate.Month == month
                            && t.TransactionDate.Year == year
                            && t.Category.Type == TransactionType.Expense
                            && t.Wallet.UserId == userId
                            && categoryIdList.Contains(t.CategoryId))
                .GroupBy(t => t.CategoryId)
                .Select(g => new { CategoryId = g.Key, Total = g.Sum(t => t.Amount) })
                .ToListAsync();

            return results.ToDictionary(x => x.CategoryId, x => x.Total);
        }

        private static decimal TransactionBalanceDelta(TransactionType type, decimal amount)
            => type == TransactionType.Income ? amount : -amount;

        private static void ApplyTransactionToBalance(Wallet wallet, TransactionType type, decimal amount)
            => ApplyBalanceDelta(wallet, TransactionBalanceDelta(type, amount));

        private static void ApplyBalanceDelta(Wallet wallet, decimal delta)
        {
            wallet.Balance += delta;
            wallet.LastUpdated = DateTime.UtcNow;
        }
    }
}
