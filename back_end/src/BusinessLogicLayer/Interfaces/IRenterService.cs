using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Renter;

namespace BusinessLogicLayer.Interfaces
{
    public interface IRenterService
    {
        // === SỬA: Bỏ (int userId) ===
        Task<RenterDocumentsViewDto> GetMyDocumentsAsync();

        // === SỬA: Bỏ (int userId) ===
        Task<RenterDocumentsViewDto> UpsertMyDocumentsAsync(RenterDocumentsUpsertDto dto);

        // (Hàm này vẫn cần userId vì nó có thể được gọi từ service khác)
        Task<bool> HasVerifiedDocumentsAsync(int userId);
    }
}