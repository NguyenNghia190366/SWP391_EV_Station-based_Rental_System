using BusinessLogicLayer.DTOs.Station;

namespace BusinessLogicLayer.Interfaces
{
    /// <summary>
    /// Nghiệp vụ quản lý trạm (Station).
    /// Service sẽ gọi trực tiếp ApplicationDbContext (không dùng Repository).
    /// </summary>
    public interface IStationService
    {
        /// <summary>
        /// Lấy danh sách trạm có phân trang + tìm kiếm theo tên/địa chỉ.
        /// </summary>
        Task<(IEnumerable<StationViewDto> data, int total)> GetPagedAsync(int page, int pageSize, string? search);

        /// <summary>
        /// Lấy chi tiết 1 trạm theo ID.
        /// </summary>
        Task<StationViewDto?> GetByIdAsync(int id);

        /// <summary>
        /// Tạo mới trạm, trả về StationId.
        /// </summary>
        Task<int> CreateAsync(StationCreateDto dto);

        /// <summary>
        /// Cập nhật thông tin trạm theo ID.
        /// </summary>
        Task<bool> UpdateAsync(int id, StationUpdateDto dto);

        /// <summary>
        /// Xoá trạm (tuỳ chính sách: hard delete hoặc đổi Status = INACTIVE).
        /// </summary>
        Task<bool> DeleteAsync(int id);
    }
}
