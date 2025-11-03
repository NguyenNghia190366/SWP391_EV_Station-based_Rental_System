using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.FeeType
{
    public class FeeTypeViewDto
    {
        public int FeeTypeId { get; set; }
        public string FeeType { get; set; } = string.Empty; // Tên loại phí, ví dụ: "Phí vệ sinh"
        public decimal Amount { get; set; }  // Số tiền (đã định sẵn)
    }
}