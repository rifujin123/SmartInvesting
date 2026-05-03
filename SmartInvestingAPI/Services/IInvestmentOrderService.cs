using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Services
{
    public interface IInvestmentOrderService
    {
        Task<InvestmentOrder> BuyAsync(
            Guid userId,
            Guid walletId,
            int assetId,
            decimal quantity,
            decimal price,
            decimal fee,
            DateTime? orderDate = null);

        Task<InvestmentOrder> SellAsync(
            Guid userId,
            Guid walletId,
            int assetId,
            decimal quantity,
            decimal price,
            decimal fee,
            DateTime? orderDate = null);
    }
}
