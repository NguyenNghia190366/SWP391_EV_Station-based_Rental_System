using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.ExtraFee
{
    public class ExtraFeeCreateDto
    {
        [Required]
        public int OrderId { get; set; } // Đơn hàng nào?

        [Required]
        public int FeeTypeId { get; set; } // Phí loại gì?

        public string Description { get; set; } = string.Empty; // Ghi chú
    }
}