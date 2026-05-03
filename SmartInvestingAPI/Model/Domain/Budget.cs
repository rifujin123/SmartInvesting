using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInvestingAPI.Model.Domain
{
    public class Budget : BaseAuditable
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal AmountLimit { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        public Guid UserId { get; set; }

        [ForeignKey(nameof(Category))]
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;
    }
}
