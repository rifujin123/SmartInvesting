namespace SmartInvestingAPI.Services
{
    public interface IFireAntService
    {
        Task<decimal> GetCurrentPriceAsync(string symbol);
    }
}
