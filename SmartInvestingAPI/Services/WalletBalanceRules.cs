using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public static class WalletBalanceRules
    {
        public static decimal GetTransactionDelta(TransactionType type, decimal amount)
            => type == TransactionType.Income ? amount : -amount;

        public static decimal GetIncomeDelta(decimal amount)
            => amount;

        public static decimal GetBuyDelta(decimal quantity, decimal price, decimal fee)
            => -GetBuyCost(quantity, price, fee);

        public static decimal GetSellDelta(decimal quantity, decimal price, decimal fee)
            => GetSellProceeds(quantity, price, fee);

        public static decimal GetBuyCost(decimal quantity, decimal price, decimal fee)
            => quantity * price + fee;

        public static decimal GetSellProceeds(decimal quantity, decimal price, decimal fee)
            => quantity * price - fee;

        public static void ApplyDelta(Wallet wallet, decimal delta)
        {
            wallet.Balance += delta;
            wallet.LastUpdated = DateTime.UtcNow;
        }
    }
}
