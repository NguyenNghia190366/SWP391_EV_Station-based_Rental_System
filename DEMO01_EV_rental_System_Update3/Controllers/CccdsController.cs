using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data.CurrentUserAccessor; // <-- Import interface của cậu

// DTO upload (Chỉ chứa thông tin CCCD, không chứa RenterId vì lấy từ Token)
public class CccdUpsertDto
{
    public string IdCardNumber { get; set; } = string.Empty;
    public string UrlFront { get; set; } = string.Empty;
    public string UrlBack { get; set; } = string.Empty;
}

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập
    public class CccdsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;
        private readonly ICurrentUserAccessor _currentUserAccessor; // <-- Inject cái này

        public CccdsController(RentalEvSystemFinalContext context, ICurrentUserAccessor currentUserAccessor)
        {
            _context = context;
            _currentUserAccessor = currentUserAccessor;
        }

        // API này dành cho Renter tự xem CCCD của mình
        [HttpGet("MyCccd")]
        public async Task<ActionResult<Cccd>> GetMyCccd()
        {
            var userId = _currentUserAccessor.UserId;
            var renter = await _context.Renters.FirstOrDefaultAsync(r => r.UserId == userId);
            if (renter == null) return NotFound("Bạn chưa có hồ sơ Renter.");

            var cccd = await _context.Cccds.FindAsync(renter.RenterId);
            if (cccd == null) return NotFound("Bạn chưa upload CCCD.");

            return cccd;
        }

        // API Upload/Update CCCD (Logic của Huy: Upsert)
        [HttpPost("UploadMyCccd")]
        public async Task<ActionResult> UploadMyCccd(CccdUpsertDto dto)
        {
            // 1. Lấy Renter từ Token (Bảo mật)
            var userId = _currentUserAccessor.UserId;
            var renter = await _context.Renters.FirstOrDefaultAsync(r => r.UserId == userId);
            
            if (renter == null) return BadRequest("Tài khoản này không phải là Renter.");

            // 2. Tìm CCCD hiện tại (nếu có)
            var cccd = await _context.Cccds.FindAsync(renter.RenterId);

            if (cccd == null)
            {
                // Chưa có -> Tạo mới
                cccd = new Cccd
                {
                    Renter_Id = renter.RenterId,
                    id_Card_Number = dto.IdCardNumber,
                    url_Cccd_Cmnd_front = dto.UrlFront,
                    url_Cccd_Cmnd_back = dto.UrlBack
                };
                _context.Cccds.Add(cccd);
            }
            else
            {
                // Đã có -> Cập nhật
                cccd.id_Card_Number = dto.IdCardNumber;
                cccd.url_Cccd_Cmnd_front = dto.UrlFront;
                cccd.url_Cccd_Cmnd_back = dto.UrlBack;
                _context.Entry(cccd).State = EntityState.Modified;
            }

            // 3. Logic của Huy: Reset trạng thái verified về false để Admin duyệt lại
            renter.IsVerified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                 return BadRequest("Lỗi lưu dữ liệu: " + ex.Message);
            }

            return Ok(new { message = "Upload CCCD thành công. Vui lòng chờ duyệt.", data = cccd });
        }

        // (Các hàm GET/PUT/DELETE theo ID cũ của Nghĩa có thể giữ lại cho Admin dùng, 
        // nhưng nhớ thêm [Authorize(Roles="ADMIN")] để bảo mật)

        // GET: api/Cccds/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cccd>> GetCccd(int id)
        {
            var cccd = await _context.Cccds.FindAsync(id);

            if (cccd == null)
            {
                return NotFound();
            }

            return cccd;
        }

        // PUT: api/Cccds/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCccd(int id, Cccd cccd)
        {
            if (id != cccd.Renter_Id)
            {
                return BadRequest();
            }

            _context.Entry(cccd).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CccdExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

         // DELETE: api/Cccds/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCccd(int id)
        {
            var cccd = await _context.Cccds.FindAsync(id);
            if (cccd == null)
            {
                return NotFound();
            }

            _context.Cccds.Remove(cccd);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CccdExists(int id)
        {
            return _context.Cccds.Any(e => e.Renter_Id == id);
        }
    }
}