using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class AssetDto
    {
        public int Id { get; set; }
        public string Ticker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public AssetType Type { get; set; }
        public decimal CurrentPrice { get; set; }
    }
} 
