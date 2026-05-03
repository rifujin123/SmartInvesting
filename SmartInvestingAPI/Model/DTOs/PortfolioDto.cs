using SmartInvestingAPI.Model.Domain;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.DTOs
{
    public class PortfolioDto
    {
        public Guid Id { get; set; }

        //Asset Information
        public string Ticker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty ;
        public string AssetType { get; set; } = string.Empty;

        //Portfolio Information
        public decimal TotalQuantity { get; set; }
        public decimal AvgPrice { get; set; }
        public decimal CurrentPrice { get; set; }

        public decimal TotalValue => TotalQuantity * CurrentPrice;
        public decimal TotalInvestment => TotalQuantity * AvgPrice;
        public decimal ProfitLoss => TotalValue - TotalInvestment;
        public decimal ProfitLossPercent
        {
            get
            {
                if (TotalInvestment == 0)
                    return 0;

                return (ProfitLoss / TotalInvestment) * 100;
            }
        } 
    }
}
