using AutoMapper;
using BusinessLogicLayer.DTOs.Renter;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;
using BusinessLogicLayer.Helpers.CurrentUserAccessor;

namespace BusinessLogicLayer.Services
{
    public class RenterService : IRenterService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ICurrentUserAccessor _currentUser;

        public RenterService(ApplicationDbContext db, IMapper mapper, ICurrentUserAccessor currentUser)
        {
            _db = db;
            _mapper = mapper;
            _currentUser = currentUser;
        }

        // Implement các phương thức của IRenterService ở đây
        private async Task<(Renter renter, CCCD? cccd, Driver_License? dl)> LoadDocumentsAsync(int userId)
        {
            var renter = await _db.Renters
                .Include(r => r.CCCD)
                .Include(r => r.Driver_License)
                .SingleOrDefaultAsync(r => r.user_id == userId);

            if (renter == null) 
            {
                throw new KeyNotFoundException($"Renter not found for User ID: {userId}");
            }

            return (renter, renter.CCCD, renter.Driver_License); 
        }

        public async Task<RenterDocumentsViewDto> GetMyDocumentsAsync()
        {
            int userId = _currentUser.UserId; // Lấy ID từ helper
            if (userId == 0) throw new UnauthorizedAccessException("Người dùng không hợp lệ.");

            var (renter, cccd, dl) = await LoadDocumentsAsync(userId);
            
            var dto = new RenterDocumentsViewDto();
            if (cccd != null) _mapper.Map(cccd, dto); // Giả định AutoMapper đã được refactor
            if (dl != null) _mapper.Map(dl, dto);   // Giả định AutoMapper đã được refactor
            
            dto.IsVerified = renter.is_verified;

            return dto;
        }
        
        public async Task<RenterDocumentsViewDto> UpsertMyDocumentsAsync(RenterDocumentsUpsertDto dto)
        {
            int userId = _currentUser.UserId; // Lấy ID từ helper
            if (userId == 0) throw new UnauthorizedAccessException("Người dùng không hợp lệ.");

            var (renter, cccd, dl) = await LoadDocumentsAsync(userId);
            var renterId = renter.renter_id;

            // (Logic map và set is_verified = false vẫn giữ nguyên)
            if (cccd == null)
            {
                cccd = new CCCD { renter_id = renterId };
                _db.CCCDs.Add(cccd);
            }
            _mapper.Map(dto, cccd); // Map DTO -> CCCD

            if (dl == null)
            {
                dl = new Driver_License { renter_id = renterId };
                _db.Driver_Licenses.Add(dl);
            }
            _mapper.Map(dto, dl); // Map DTO -> Driver_License
            
            renter.is_verified = false;
            await _db.SaveChangesAsync();
            
            // Gọi lại hàm Get (không cần tham số)
            return await GetMyDocumentsAsync();
        }

        public async Task<bool> HasVerifiedDocumentsAsync(int userId)
        {
            var (renter, cccd, dl) = await LoadDocumentsAsync(userId);

            if (renter == null) 
            {
                return false;
            }

            // === LOGIC MỚI: KIỂM TRA 4 ẢNH ===
            // Kiểm tra CCCD: Phải tồn tại VÀ 3 trường con không được rỗng
            bool hasValidCccd = cccd != null 
                                && !string.IsNullOrWhiteSpace(cccd.id_card_number)
                                && !string.IsNullOrWhiteSpace(cccd.url_cccd_cmnd_front) // <-- SỬA
                                && !string.IsNullOrWhiteSpace(cccd.url_cccd_cmnd_back);  // <-- SỬA

            // Kiểm tra Driver License: Tương tự
            bool hasValidDl = dl != null
                            && !string.IsNullOrWhiteSpace(dl.driver_license_number)
                            && !string.IsNullOrWhiteSpace(dl.url_driver_license_front) // <-- SỬA
                            && !string.IsNullOrWhiteSpace(dl.url_driver_license_back);  // <-- SỬA

            // 4. Trả về kết quả: Phải có cả 2 VÀ renter phải được 'verified'
            return hasValidCccd && hasValidDl && renter.is_verified;
        }

    }
}