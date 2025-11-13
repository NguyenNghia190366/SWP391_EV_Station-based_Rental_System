using BusinessLogicLayer.DTOs.Complaint;

namespace BusinessLogicLayer.Interfaces
{
    public interface IComplaintService
    {
        // Yêu cầu 1: Cho Renter
        Task<ComplaintViewDto> CreateComplaintAsync(ComplaintCreateDto createDto);

        // Yêu cầu 2: Cho Admin/Staff xem danh sách khiếu nại
        Task<IEnumerable<ComplaintViewDto>> GetComplaintsAsync(string? statusFilter = null); // statusFilter có thể null

        // Yêu cầu 3: Cho Admin/Staff
        Task<bool> ResolveComplaintAsync(int complaintId);

        // (Bonus: Hàm cho Renter xem lịch sử khiếu nại của mình)
        Task<IEnumerable<ComplaintViewDto>> GetMyComplaintsAsync();
    }
}