using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Data.CurrentUserAccessor;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// DTO upload
public class DriverLicenseUpsertDto
{
    public string LicenseNumber { get; set; } = string.Empty;
    public string UrlFront { get; set; } = string.Empty;
    public string UrlBack { get; set; } = string.Empty;
}

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DriverLicensesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;
        private readonly ICurrentUserAccessor _currentUserAccessor; // <-- Inject

        public DriverLicensesController(RentalEvSystemFinalContext context, ICurrentUserAccessor currentUserAccessor)
        {
            _context = context;
            _currentUserAccessor = currentUserAccessor;
        }

        // API xem bằng lái của chính mình
        [HttpGet("MyLicense")]
        public async Task<ActionResult<DriverLicense>> GetMyLicense()
        {
            var userId = _currentUserAccessor.UserId;
            var renter = await _context.Renters.FirstOrDefaultAsync(r => r.UserId == userId);
            if (renter == null) return NotFound("Bạn chưa có hồ sơ Renter.");

            var license = await _context.DriverLicenses.FindAsync(renter.RenterId);
            if (license == null) return NotFound("Bạn chưa upload Bằng lái.");

            return license;
        }

        // API Upload/Update Bằng lái (Logic của Huy: Upsert)
        [HttpPost("UploadMyLicense")]
        public async Task<ActionResult> UploadMyLicense(DriverLicenseUpsertDto dto)
        {
            // 1. Lấy Renter từ Token
            var userId = _currentUserAccessor.UserId;
            var renter = await _context.Renters.FirstOrDefaultAsync(r => r.UserId == userId);
            
            if (renter == null) return BadRequest("Tài khoản này không phải là Renter.");

            // 2. Tìm Bằng lái hiện tại
            var dl = await _context.DriverLicenses.FindAsync(renter.RenterId);

            if (dl == null)
            {
                // Tạo mới
                dl = new DriverLicense
                {
                    Renter_Id = renter.RenterId,
                    DriverLicenseNumber = dto.LicenseNumber,
                    url_Driver_License_front = dto.UrlFront,
                    url_Driver_License_back = dto.UrlBack
                };
                _context.DriverLicenses.Add(dl);
            }
            else
            {
                // Cập nhật
                dl.DriverLicenseNumber = dto.LicenseNumber;
                dl.url_Driver_License_front = dto.UrlFront;
                dl.url_Driver_License_back = dto.UrlBack;
                _context.Entry(dl).State = EntityState.Modified;
            }

            // 3. Reset trạng thái verified
            renter.IsVerified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                 return BadRequest("Lỗi lưu dữ liệu: " + ex.Message);
            }

            return Ok(new { message = "Upload Bằng lái thành công. Vui lòng chờ duyệt.", data = dl });
        }
    }
}