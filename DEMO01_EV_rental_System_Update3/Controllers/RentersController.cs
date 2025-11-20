using DEMO01_EV_rental_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// DTO hiển thị thông tin xác thực (Gộp Renter + User + Docs)
public class RenterVerificationViewDto
{
    public int RenterId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public string? CccdNumber { get; set; }
    public string? CccdFrontUrl { get; set; }
    public string? CccdBackUrl { get; set; }
    public string? LicenseNumber { get; set; }
    public string? LicenseFrontUrl { get; set; }
    public string? LicenseBackUrl { get; set; }
}

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Mặc định yêu cầu đăng nhập
    public class RentersController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public RentersController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // 1. GET ALL (Admin xem danh sách Renter)
        // Thêm filter: ?pendingOnly=true để chỉ lấy những người đang chờ duyệt
        [Authorize(Roles = "ADMIN")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RenterVerificationViewDto>>> GetRenters([FromQuery] bool pendingOnly = false) //false là lấy hết Renters
        {
            var query = _context.Renters
                .Include(r => r.User)
                .Include(r => r.Cccd)
                .Include(r => r.DriverLicense)
                .AsNoTracking();

            if (pendingOnly) // True là lấy những hồ sơ chờ duyệt
            {
                // Logic của Huy: Lấy danh sách chưa xác thực
                query = query.Where(r => r.IsVerified == false);
            }

            var list = await query.Select(r => new RenterVerificationViewDto
            {
                RenterId = r.RenterId,
                FullName = r.User.FullName,
                Email = r.User.Email,
                PhoneNumber = r.User.PhoneNumber ?? string.Empty,
                IsVerified = r.IsVerified,
                CccdNumber = r.Cccd != null ? r.Cccd.id_Card_Number : null,
                CccdFrontUrl = r.Cccd != null ? r.Cccd.url_Cccd_Cmnd_front : null,
                CccdBackUrl = r.Cccd != null ? r.Cccd.url_Cccd_Cmnd_back : null,
                LicenseNumber = r.DriverLicense != null ? r.DriverLicense.DriverLicenseNumber : null,
                LicenseFrontUrl = r.DriverLicense != null ? r.DriverLicense.url_Driver_License_front : null,
                LicenseBackUrl = r.DriverLicense != null ? r.DriverLicense.url_Driver_License_back : null
            }).ToListAsync();

            return Ok(list);
        }

        // 2. GET BY ID (Xem chi tiết 1 hồ sơ để duyệt)
        [Authorize(Roles = "ADMIN")]
        [HttpGet("{id}")]
        public async Task<ActionResult<RenterVerificationViewDto>> GetRenter(int id)
        {
            var r = await _context.Renters
                .Include(r => r.User)
                .Include(r => r.Cccd)
                .Include(r => r.DriverLicense)
                .FirstOrDefaultAsync(x => x.RenterId == id);

            if (r == null) return NotFound();

            var dto = new RenterVerificationViewDto
            {
                RenterId = r.RenterId,
                FullName = r.User.FullName,
                Email = r.User.Email,
                PhoneNumber = r.User.PhoneNumber ?? string.Empty,
                IsVerified = r.IsVerified,
                CccdNumber = r.Cccd != null ? r.Cccd.id_Card_Number : null,
                CccdFrontUrl = r.Cccd != null ? r.Cccd.url_Cccd_Cmnd_front : null,
                CccdBackUrl = r.Cccd != null ? r.Cccd.url_Cccd_Cmnd_back : null,
                LicenseNumber = r.DriverLicense != null ? r.DriverLicense.DriverLicenseNumber : null,
                LicenseFrontUrl = r.DriverLicense != null ? r.DriverLicense.url_Driver_License_front : null,
                LicenseBackUrl = r.DriverLicense != null ? r.DriverLicense.url_Driver_License_back : null
            };

            return dto;
        }

        // 3. PUT: Verify Renter (Hành động duyệt của Admin/Staff)
        // [Authorize(Roles = "ADMIN, STAFF")]
        [HttpPut("VerifyRenter/{id}")]
        public async Task<IActionResult> VerifyRenter(int id, [FromQuery] bool isVerified = true)
        {
            var renter = await _context.Renters.FindAsync(id);
            if (renter == null) return NotFound();

            // Logic của Huy: Set trạng thái xác thực
            renter.IsVerified = isVerified;
            await _context.SaveChangesAsync();

            // TODO: Nếu có NotificationService, gọi ở đây để báo cho User biết
            // var userId = renter.UserId;
            // _notificationService.Send(userId, "Hồ sơ của bạn đã được duyệt!");

            return NoContent();
        }

        // (Các hàm POST, DELETE Renter thường ít dùng trực tiếp vì Renter đi theo User, 
        // nhưng nếu giữ lại code cũ của Nghĩa thì cứ để nguyên, chỉ cần chú ý Auth)
    }
}