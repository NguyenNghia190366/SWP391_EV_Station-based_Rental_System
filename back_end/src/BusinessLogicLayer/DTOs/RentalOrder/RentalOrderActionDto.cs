using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.RentalOrder
{
    // Các hành động
    public enum RentalAction
    {
        CANCEL_BY_RENTER,
        START_RENTAL, // Staff giao xe
        RETURN_VEHICLE // Staff nhận xe
    }
    public class RentalOrderActionDto
    {
        [Required]
        public RentalAction Action { get; set; }
        
        public string? Notes { get; set; } // Lý do hủy/ghi chú

        // --- Dùng cho START_RENTAL ---
        [Url]
        public string? ImgVehicleBeforeUrl { get; set; } = string.Empty;

        // --- Dùng cho RETURN_VEHICLE ---
        [Url]
        public string? ImgVehicleAfterUrl { get; set; } = string.Empty;
        public string? VehicleConditionAfter { get; set; } = string.Empty; // 'GOOD', 'DAMAGED'
        public int? CurrentMileage { get; set; }
    }
}