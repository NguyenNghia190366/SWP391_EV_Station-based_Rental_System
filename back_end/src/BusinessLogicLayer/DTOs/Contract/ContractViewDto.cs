using BusinessLogicLayer.DTOs.RentalOrder;
using BusinessLogicLayer.DTOs.Renter;
using BusinessLogicLayer.DTOs.Staff;
using BusinessLogicLayer.DTOs.Vehicle;

namespace BusinessLogicLayer.DTOs.Contract
{
    public class ContractViewDto
    {
        public int ContractId { get; set; }
        public DateTime SignedDate { get; set; }
        public string? ContractPdfUrl { get; set; }

        // --- THÊM 2 DÒNG NÀY ĐỂ SỬA LỖI ---
        public string? ContractRenterSigningimgUrl { get; set; }
        public string? ContractOwnerSigningimgUrl { get; set; }
        
       // --- Thông tin lồng nhau (Nested Info) ---
        public StaffBriefDto? StaffInfo { get; set; }
        public RenterBriefDto? RenterInfo { get; set; }
        public VehicleBriefDto? VehicleInfo { get; set; }
        public RentalOrderBriefDto? OrderInfo { get; set; }
    }
}