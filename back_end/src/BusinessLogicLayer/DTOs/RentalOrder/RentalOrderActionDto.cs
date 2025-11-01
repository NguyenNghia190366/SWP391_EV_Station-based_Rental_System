using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.RentalOrder
{
    // Các hành động
    public enum RentalAction
    {
        CANCEL_BY_RENTER,
        APPROVE_BY_STAFF,
        REJECT_BY_STAFF,
        START_RENTAL, // Staff giao xe
        RETURN_VEHICLE // Staff nhận xe
    }
    public class RentalOrderActionDto
    {
        [Required]
        public RentalAction Action { get; set; }
        
        public string? Notes { get; set; } // Lý do hủy/ghi chú

        // Dùng khi Staff nhận xe (RETURN_VEHICLE)
        public string? VehicleConditionAfter { get; set; } // 'GOOD', 'DAMAGED'
        public string? ImgVehicleAfterUrl { get; set; } 
    }
}