using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class CashPaymentCreateDto
    {
        [Required]
        public int OrderId { get; set; }
    }
}