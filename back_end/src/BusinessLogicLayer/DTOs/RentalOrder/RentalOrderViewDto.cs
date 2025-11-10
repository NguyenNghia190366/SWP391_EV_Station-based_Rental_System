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
        public DateTime CreatedAt { get; set; }

        // THÊM CÁC TRƯỜNG MỚI TỪ BẢNG PAYMENT
        public string? FeeType { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    // --- (2) TẠO DTO LỒNG NHAU MỚI CHO STAFF ---
    public class StaffNestedDto
    {
        public int StaffId { get; set; }
        public string FullName { get; set; } = string.Empty;
    }
    
    public class RentalOrderViewDto
    {
        public int OrderId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        
        // --- THÊM 2 TRƯỜNG ẢNH MỚI (1-N) ---
        public List<string> ImgVehicleBefores { get; set; } = new List<string>();
        public List<string> ImgVehicleAfters { get; set; } = new List<string>();
       
        // Dữ liệu lồng nhau
        public RenterNestedDto? Renter { get; set; }
        public VehicleViewDto? Vehicle { get; set; }
        public StationNestedDto? PickupStation { get; set; }
        public StationNestedDto? ReturnStation { get; set; }
        
        // --- THÊM 2 TRƯỜNG STAFF MỚI ---
        public StaffNestedDto? PickupStaff { get; set; }
        public StaffNestedDto? ReturnStaff { get; set; }
        
        public List<PaymentNestedDto> Payments { get; set; } = new List<PaymentNestedDto>();
    }
}