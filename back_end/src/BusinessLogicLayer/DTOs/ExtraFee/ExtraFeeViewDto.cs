using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.ExtraFee
{
    public class ExtraFeeViewDto
    {
        public int FeeId { get; set; }       // ID của ExtraFee
        public int OrderId { get; set; }
        public string FeeType { get; set; } = string.Empty;  // Tên loại phí
        public decimal Amount { get; set; }   // Số tiền của phí này
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}