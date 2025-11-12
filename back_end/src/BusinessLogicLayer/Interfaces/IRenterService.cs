using BusinessLogicLayer.DTOs.Renter;

namespace BusinessLogicLayer.Interfaces
{
    public interface IRenterService
    {
        // === SỬA: Bỏ (int userId) ===
        Task<RenterDocumentsViewDto> GetMyDocumentsAsync();

        Task<RenterDocumentsViewDto> UpsertMyCccdAsync(CccdUpsertDto dto);
        Task<RenterDocumentsViewDto> UpsertMyDriverLicenseAsync(DriverLicenseUpsertDto dto);

        // (Hàm này vẫn cần userId vì nó có thể được gọi từ service khác)
        Task<bool> HasVerifiedDocumentsAsync(int userId);

        // === CHỨC NĂNG QUẢN LÝ (MỚI) ===

        // Dùng cho Admin (Get list)
        Task<IEnumerable<RenterVerificationViewDto>> GetPendingVerificationsAsync();

        // Dùng cho Admin/Staff (Get by Id)
        Task<RenterVerificationViewDto> GetRenterForVerificationAsync(int renterId);
        
        // Dùng cho Admin/Staff (Action)
        Task<bool> SetRenterVerificationStatusAsync(int renterId, bool isVerified);
    }
}