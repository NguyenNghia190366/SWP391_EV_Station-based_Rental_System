using BusinessLogicLayer.DTOs.ExtraFee;
using BusinessLogicLayer.DTOs.FeeType;

namespace BusinessLogicLayer.Interfaces
{
    public interface IExtrasService
    {
        // --- Quản lý FeeType (Dành cho Admin) ---
        Task<IEnumerable<FeeTypeViewDto>> GetAllFeeTypesAsync();
        Task<FeeTypeViewDto> CreateFeeTypeAsync(FeeTypeCreateDto dto);
        Task UpdateFeeTypeAsync(int feeTypeId, FeeTypeUpdateDto dto);
        Task DeleteFeeTypeAsync(int feeTypeId);

        // --- Quản lý ExtraFee (Dành cho Staff/Renter) ---
        Task<ExtraFeeViewDto> AddExtraFeeToOrderAsync(ExtraFeeCreateDto dto); 
        Task DeleteExtraFeeAsync(int feeId); 
        Task<IEnumerable<ExtraFeeViewDto>> GetExtraFeesForOrderAsync(int orderId);
    }
}