using SmartInvestingAPI.Model.Domain;

namespace SmartInvestingAPI.Model.DTOs
{
    public class IncomeEventDto
    {
        public Guid Id { get; set; }
        public Guid WalletId { get; set; }
        public int? AssetId { get; set; }
        public string? AssetTicker { get; set; }
        public string? AssetName { get; set; }
        public IncomeEventType Type { get; set; }
        public decimal Amount { get; set; }
        public DateTime EventDate { get; set; }
        public string? Note { get; set; }
    }
}
