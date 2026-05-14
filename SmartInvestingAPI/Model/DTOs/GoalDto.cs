namespace SmartInvestingAPI.Model.DTOs
{
    public class GoalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public DateTime? Deadline { get; set; }
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal ProgressPercent => TargetAmount <= 0 ? 0 : Math.Round(CurrentAmount / TargetAmount * 100, 2);
        public bool IsCompleted => TargetAmount > 0 && CurrentAmount >= TargetAmount;
    }
}
