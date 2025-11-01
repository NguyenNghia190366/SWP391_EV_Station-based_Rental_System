using BusinessLogicLayer.DTOs.Vehicles;

namespace BusinessLogicLayer.DTOs.RentalOrder
{
    // DTO lồng nhau tối giản cho Renter
    public class RenterNestedDto
    {
        public int RenterId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
    
    // DTO lồng nhau cho Payment
    public class PaymentNestedDto
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
    }
    public class RentalOrderViewDto
    {
        public int OrderId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        public string? ImgVehicleBeforeUrl { get; set; } //
        public string? ImgVehicleAfterUrl { get; set; } //

        // Dữ liệu lồng nhau
        public RenterNestedDto? Renter { get; set; }
        public VehicleViewDto? Vehicle { get; set; } // Dùng lại DTO chi tiết xe
        public StationNestedDto? PickupStation { get; set; } // Dùng lại DTO trạm
        public StationNestedDto? ReturnStation { get; set; } // Dùng lại DTO trạm
        
        public List<PaymentNestedDto> Payments { get; set; } = new List<PaymentNestedDto>();
    }
}