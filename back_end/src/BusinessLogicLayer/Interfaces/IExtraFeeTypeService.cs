// BusinessLogicLayer/Interfaces/IExtraFeeTypeService.cs
using BusinessLogicLayer.DTOs.ExtraFeeType;

namespace BusinessLogicLayer.Interfaces
{
    public interface IExtraFeeTypeService
    {
        /// <summary>
        /// (Admin) Lấy danh sách tất cả loại phí (dùng cho Staff chọn)
        /// </summary>
        Task<IEnumerable<ExtraFeeTypeViewDto>> GetAllAsync();

        /// <summary>
        /// (Admin) Lấy 1 loại phí theo ID
        /// </summary>
        Task<ExtraFeeTypeViewDto?> GetByIdAsync(int id);

        /// <summary>
        /// (Admin) Tạo loại phí mới
        /// </summary>
        Task<ExtraFeeTypeViewDto> CreateAsync(ExtraFeeTypeCreateDto dto);

        /// <summary>
        /// (Admin) Cập nhật loại phí
        /// </summary>
        Task<bool> UpdateAsync(int id, ExtraFeeTypeUpdateDto dto);

        /// <summary>
        /// (Admin) Xóa 1 loại phí
        /// </summary>
        Task<bool> DeleteAsync(int id);
    }
}