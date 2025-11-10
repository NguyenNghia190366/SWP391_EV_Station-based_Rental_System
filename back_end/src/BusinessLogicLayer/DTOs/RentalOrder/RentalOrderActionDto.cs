using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.RentalOrder
{
    // Các hành động
    public enum RentalAction
    {
        CANCEL_BY_RENTER,
        APPROVE_ORDER, // Staff duyệt đơn
        START_RENTAL, // Staff giao xe
        RETURN_VEHICLE // Staff nhận xe
    }
    public class RentalOrderActionDto
    {
        [Required]
        public RentalAction Action { get; set; }
        
        public string? Notes { get; set; } // Lý do hủy/ghi chú

        // --- SỬA DÒNG NÀY (từ string sang List<string>) ---
        public List<string>? ImgVehicleAfterUrls { get; set; } // <-- Đổi tên và kiểu thành List<string>
        public string? VehicleConditionAfter { get; set; } = string.Empty; // 'GOOD', 'DAMAGED'
        public int? CurrentMileage { get; set; }
    }
}