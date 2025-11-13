using BusinessLogicLayer.DTOs.Staff;
using BusinessLogicLayer.Helpers; // Giả sử ServiceResponse ở đây

namespace BusinessLogicLayer.Interfaces
{
    public interface IStaffService
    {
        /// <summary>
        /// (Admin) Lấy danh sách tất cả nhân viên.
        /// </summary>
        Task<IEnumerable<StaffViewDto>> GetAllStaffAsync();

        /// <summary>
        /// (Admin) Gán một nhân viên vào một trạm cụ thể.
        /// Sẽ throw KeyNotFoundException nếu không tìm thấy Staff hoặc Station.
        /// </summary>
        Task<StaffViewDto> AssignStaffToStationAsync(int staffId, StaffAssignStationDto dto);
    }
}