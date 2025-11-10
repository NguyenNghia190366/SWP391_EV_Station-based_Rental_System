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

        public async Task<RenterDocumentsViewDto> GetMyDocumentsAsync(int userId)
        {
            if (_currentUser.UserId != userId)
            {
               throw new UnauthorizedAccessException("You can only view your own documents.");
            }

            var (renter, cccd, dl) = await LoadDocumentsAsync(userId);
            
            // (Giả định AutoMapper Profile của cậu đã được cập nhật
            // để map 'UrlCccdCmndFront' (DTO) sang 'url_cccd_cmnd_front' (Model))
            var dto = new RenterDocumentsViewDto();
            if (cccd != null) _mapper.Map(cccd, dto);
            if (dl != null) _mapper.Map(dl, dto);
            
            dto.IsVerified = renter.is_verified;

            return dto;
        }
        
        public async Task<RenterDocumentsViewDto> UpsertMyDocumentsAsync(int userId, RenterDocumentsUpsertDto dto)
        {
            // (Nếu cậu dùng CurrentUserAccessor, hãy thêm bước xác thực này)
            if (_currentUser.UserId != userId)
            {
                
               throw new UnauthorizedAccessException("You can only update your own documents.");
            }

            var (renter, cccd, dl) = await LoadDocumentsAsync(userId);
            var renterId = renter.renter_id;

            // Logic tạo/cập nhật CCCD (AutoMapper sẽ map 4 trường: front, back, number)
            if (cccd == null)
            {
                cccd = new CCCD { renter_id = renterId };
                _db.CCCDs.Add(cccd);
            }
            _mapper.Map(dto, cccd); // Map từ DTO -> CCCD

            // Logic tạo/cập nhật Driver_License (AutoMapper sẽ map 4 trường)
            if (dl == null)
            {
                dl = new Driver_License { renter_id = renterId };
                _db.Driver_Licenses.Add(dl);
            }
            _mapper.Map(dto, dl); // Map từ DTO -> Driver_License

            // Logic này vẫn đúng: Bất cứ khi nào upload, reset về chưa xác thực
            renter.is_verified = false;

            await _db.SaveChangesAsync();
            
            // Tối ưu: Gọi lại hàm Get để lấy DTO, thay vì map thủ công
            return await GetMyDocumentsAsync(userId);
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