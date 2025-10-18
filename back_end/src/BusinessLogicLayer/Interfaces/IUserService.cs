using BusinessLogicLayer.DTOs.User;

namespace BusinessLogicLayer.Interfaces
{
    /// <summary>
    /// Nghiệp vụ quản lý người dùng (Admin dùng).
    /// Tuần 2 tối thiểu: xem danh sách + xem chi tiết; 
    /// có thể thêm tạo/sửa nếu We muốn chốt sớm.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Lấy người dùng có phân trang + filter (tùy chọn: theo Role/Status).
        /// </summary>
        Task<(IEnumerable<UserViewDto> data, int total)> GetPagedAsync(int page, int pageSize, string? role, string? status, string? keyword);

        /// <summary>
        /// Lấy chi tiết 1 người dùng.
        /// </summary>
        Task<UserViewDto?> GetByIdAsync(int id);

        /// <summary>
        /// Tạo tài khoản mới (Admin).
        /// </summary>
        Task<int> CreateAsync(UserCreateDto dto);

        /// <summary>
        /// Cập nhật thông tin/role/status (Admin).
        /// </summary>
        Task<bool> UpdateAsync(int id, UserUpdateDto dto);

        /// <summary>
        /// Khoá/Mở khoá nhanh theo Status (ACTIVE/INACTIVE).
        /// </summary>
        Task<bool> SetStatusAsync(int id, string status);
    }
}
