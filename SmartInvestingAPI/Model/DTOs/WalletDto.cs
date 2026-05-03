namespace SmartInvestingAPI.Model.DTOs
{
    public class WalletDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Balance { get; set; } = 0;
        public string Currency { get; set; } = "VND";
        public bool IsPaper { get; set; }
    }
}
