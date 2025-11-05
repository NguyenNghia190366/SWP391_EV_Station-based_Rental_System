using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class CashPaymentCreateDto
    {
        [Required]
        public int OrderId { get; set; }
    }
}