namespace SmartInvestingAPI.Model.Domain
{
    public class BaseAuditable
    {
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string? CreatedBy { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
