using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public class Goal : BaseAuditable
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TargetAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal CurrentAmount { get; set; }

        public DateTime? Deadline { get; set; }

        [MaxLength(50)]
        public string Icon { get; set; } = "flag";

        [MaxLength(20)]
        public string Color { get; set; } = "#DBEAFE";

        public Guid UserId { get; set; }
    }
}
