namespace SmartInvestingAPI.Model.DTOs
{
    public class FireAntSymbolResponse
    {
        public string Symbol { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Change { get; set; }
        public DateTime PriceAt { get; set; }
    }
}
