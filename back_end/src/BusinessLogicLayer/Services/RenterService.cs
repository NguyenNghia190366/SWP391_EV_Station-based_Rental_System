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
        private readonly INotificationService _notificationService;
            
        public RenterService(ApplicationDbContext db, IMapper mapper, ICurrentUserAccessor currentUser, INotificationService notificationService)
        {
            _db = db;
            _mapper = mapper;
            _currentUser = currentUser;
            _notificationService = notificationService;
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

        public async Task<RenterDocumentsViewDto> UpsertMyCccdAsync(CccdUpsertDto dto)
        {
            int userId = _currentUser.UserId;
            if (userId == 0) throw new UnauthorizedAccessException("Người dùng không hợp lệ.");

            // Dùng lại hàm LoadDocumentsAsync để lấy Renter, cccd, và renterId
            var (renter, cccd, _) = await LoadDocumentsAsync(userId);
            var renterId = renter.renter_id;

            // 1. Xử lý CCCD
            if (cccd == null)
            {
                cccd = new CCCD { renter_id = renterId };
                _db.CCCDs.Add(cccd);
            }
            _mapper.Map(dto, cccd); // Map DTO (mới) -> CCCD
            
            // 2. Set lại trạng thái chờ duyệt
            renter.is_verified = false;
            await _db.SaveChangesAsync();
            
            // 3. Trả về DTO view tổng hợp
            return await GetMyDocumentsAsync();
        }

        public async Task<RenterDocumentsViewDto> UpsertMyDriverLicenseAsync(DriverLicenseUpsertDto dto)
        {
            int userId = _currentUser.UserId;
            if (userId == 0) throw new UnauthorizedAccessException("Người dùng không hợp lệ.");

            // Dùng lại hàm LoadDocumentsAsync để lấy Renter, dl, và renterId
            var (renter, _, dl) = await LoadDocumentsAsync(userId);
            var renterId = renter.renter_id;

            // 1. Xử lý Driver License
            if (dl == null)
            {
                dl = new Driver_License { renter_id = renterId };
                _db.Driver_Licenses.Add(dl);
            }
            _mapper.Map(dto, dl); // Map DTO (mới) -> Driver_License
            
            // 2. Set lại trạng thái chờ duyệt
            renter.is_verified = false;
            await _db.SaveChangesAsync();
            
            // 3. Trả về DTO view tổng hợp
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

        // === CHỨC NĂNG QUẢN LÝ (MỚI) ===

        // Hàm helper để load đầy đủ thông tin Renter
        private IQueryable<Renter> GetFullRenterQuery()
        {
            return _db.Renters
                .Include(r => r.user)
                .Include(r => r.CCCD)
                .Include(r => r.Driver_License);
        }

        // 1. Cho ADMIN: Lấy danh sách chờ duyệt
        public async Task<IEnumerable<RenterVerificationViewDto>> GetPendingVerificationsAsync()
        {
            var pendingRenters = await GetFullRenterQuery()
                .Where(r => r.is_verified == false) // Lấy các Renter chưa xác thực [cite: 20]
                .OrderBy(r => r.registration_date) // Ưu tiên người cũ
                .ToListAsync();

            return _mapper.Map<IEnumerable<RenterVerificationViewDto>>(pendingRenters);
        }

        // 2. Cho ADMIN/STAFF: Lấy chi tiết 1 Renter
        public async Task<RenterVerificationViewDto> GetRenterForVerificationAsync(int renterId)
        {
            var renter = await GetFullRenterQuery()
                .SingleOrDefaultAsync(r => r.renter_id == renterId);

            if (renter == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Renter với ID: {renterId}");
            }

            return _mapper.Map<RenterVerificationViewDto>(renter);
        }

        // 3. Cho ADMIN/STAFF: Cập nhật trạng thái
        public async Task<bool> SetRenterVerificationStatusAsync(int renterId, bool isVerified)
        {
            var renter = await _db.Renters.FindAsync(renterId);
            if (renter == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy Renter với ID: {renterId}");
            }

            if (renter.is_verified == isVerified)
            {
                return false; 
            }
            renter.is_verified = isVerified;
            await _db.SaveChangesAsync();

            // === GỌI NOTIFICATION SERVICE ===
            // 1. Chuẩn bị message và type
            string message;
            string type;

            if (isVerified)
            {
                message = "Chúc mừng! Hồ sơ và giấy tờ của bạn đã được xác thực thành công.";
                type = "RENTER_VERIFIED_APPROVED";
            }
            else
            {
                message = "Rất tiếc, hồ sơ của bạn chưa được duyệt. Vui lòng kiểm tra lại giấy tờ và cập nhật.";
                type = "RENTER_VERIFIED_REJECTED";
            }

            // 2. Gửi thông báo
            await _notificationService.CreateNotificationAsync(
                renter.user_id, // Lấy user_id ngay từ Renter object 
                message,
                type
            );


            return true;
        }

    }
}