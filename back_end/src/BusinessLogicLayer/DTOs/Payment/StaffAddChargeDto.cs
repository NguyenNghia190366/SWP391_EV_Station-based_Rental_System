// BusinessLogicLayer/DTOs/Payment/StaffAddChargeDto.cs
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Payment
{
    // DTO cho Staff thêm phí phát sinh (ghi nợ)
    public class StaffAddChargeDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public int ExtraFeeTypeId { get; set; } // Loại phí (từ bảng ExtraFeeType)

        public string? Description { get; set; } // Ghi chú thêm của Staff
    }
}