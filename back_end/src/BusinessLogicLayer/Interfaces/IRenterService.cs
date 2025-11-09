using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Renter;

namespace BusinessLogicLayer.Interfaces
{
    public interface IRenterService
    {
        Task<RenterDocumentsViewDto> GetMyDocumentsAsync(int userId);
        Task<RenterDocumentsViewDto> UpsertMyDocumentsAsync(int userId, RenterDocumentsUpsertDto dto);
        Task<bool> HasVerifiedDocumentsAsync(int userId); // dùng để chặn đặt xe
    }
}