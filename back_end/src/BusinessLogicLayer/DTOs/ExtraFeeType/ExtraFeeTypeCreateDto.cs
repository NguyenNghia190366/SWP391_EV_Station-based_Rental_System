using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.ExtraFeeType
{
    public class ExtraFeeTypeCreateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string ExtraFeeTypeName { get; set; } = string.Empty;

        [Required]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "Amount must be zero or positive.")]
        public decimal Amount { get; set; }
    }
}