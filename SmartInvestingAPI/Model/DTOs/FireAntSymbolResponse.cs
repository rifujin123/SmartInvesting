namespace SmartInvestingAPI.Model.DTOs
{
    public class FireAntSymbolResponse
    {
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? LatestPrice { get; set; }
        public decimal? HotScore { get; set; }
        public decimal? TradingValue { get; set; }
        public decimal? Volume { get; set; }
        public string? ImageUrl { get; set; }
    }
}
