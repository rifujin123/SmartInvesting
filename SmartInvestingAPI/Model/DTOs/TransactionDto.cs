using System;

namespace SmartInvestingAPI.Model.DTOs
{
    public class TransactionDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Note { get; set; } = string.Empty;

        public Guid WalletId { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int CategoryType { get; set; }        
        public string CategoryIcon { get; set; } = string.Empty;

        public int? AssetId { get; set; }
        public string AssetName { get; set; } = string.Empty;
    }
}
