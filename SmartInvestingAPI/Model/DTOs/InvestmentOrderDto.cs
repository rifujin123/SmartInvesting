using SmartInvestingAPI.Model.Domain;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.DTOs
{
    public class InvestmentOrderDto
    {
        public Guid Id { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Fee { get; set; }
        public OrderType OrderType { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal? RealizedProfitLoss { get; set; }
        public string AssetTicker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType {  get; set; } = string.Empty;
    }
}
