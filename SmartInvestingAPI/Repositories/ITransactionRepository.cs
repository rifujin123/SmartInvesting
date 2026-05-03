using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Repositories
{
    public interface ITransactionRepository
    {
        Task<List<Transaction>> GetAllAsync();
        Task<List<Transaction>> GetTransactionsByWalletIdAsync(Guid walletId);
        Task<Transaction?> GetByIdAsync(Guid transactionId);
        Task<Transaction?> GetTransactionByIdAndWalletIdAsync(Guid transactionId, Guid walletId);
        Task<Transaction> CreateAsync(Transaction transaction);
        Task<Transaction?> UpdateAsync(Transaction transaction);
        Task<Transaction?> DeleteAsync(Guid transactionId);
        Task<decimal> GetTotalSpentAsync(int categoryId, int month, int year);
        /// <summary>Tổng chi (Expense) theo user, category và tháng — dùng cho ngân sách.</summary>
        Task<decimal> GetTotalSpentByUserForCategoryMonthAsync(Guid userId, int categoryId, int month, int year);
        Task<decimal> GetTotalExpenseByUserForMonthAsync(Guid userId, int month, int year);
    }
}
