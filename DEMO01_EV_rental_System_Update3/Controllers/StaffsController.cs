using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

// ===================================================================
// DTOs (Copy vào file Controller hoặc tách file riêng)
// ===================================================================

// DTO Hiển thị (Gộp thông tin từ bảng User và Station)
public class StaffViewDto
{
    public int StaffId { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty; // Lấy từ User
    public string Email { get; set; } = string.Empty;    // Lấy từ User
    public string PhoneNumber { get; set; } = string.Empty; // Lấy từ User
    public int? StationId { get; set; }
    public string StationName { get; set; } = string.Empty; // Lấy từ Station
}

// DTO Cập nhật (Dùng để điều chuyển nhân viên - Logic của Huy)
public class StaffUpdateDto
{
    public int? StationId { get; set; } // Null = Cho nghỉ việc hoặc chưa phân công
}

// DTO Tạo mới (Dành cho việc set 1 User thành Staff)
public class StaffCreateDto
{
    public int UserId { get; set; }
    public int? StationId { get; set; }
}

// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class StaffsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public StaffsController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // ===================================================================
        // 1. GET ALL (Logic của Huy: Include User & Station)
        // ===================================================================
        // GET: api/Staffs
        [HttpGet]
        // [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<StaffViewDto>>> GetStaff()
        {
            // Logic của Huy: Phải Include User và Station mới có đủ thông tin hiển thị
            var staffList = await _context.Staff
                .Include(s => s.User)    // Lấy tên, email
                .Include(s => s.Station) // Lấy tên trạm
                .AsNoTracking()
                .Select(s => new StaffViewDto
                {
                    StaffId = s.StaffId,
                    UserId = s.UserId,
                    FullName = s.User.FullName,
                    Email = s.User.Email,
                    PhoneNumber = s.User.PhoneNumber ?? string.Empty,
                    StationId = s.StationId,
                    StationName = s.Station != null ? s.Station.StationName : "Chưa phân công"
                })
                .ToListAsync();

            return Ok(staffList);
        }

        // ===================================================================
        // 2. GET BY ID
        // ===================================================================
        // GET: api/Staffs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StaffViewDto>> GetStaff(int id)
        {
            var staff = await _context.Staff
                .Include(s => s.User)
                .Include(s => s.Station)
                .Where(s => s.StaffId == id)
                .Select(s => new StaffViewDto
                {
                    StaffId = s.StaffId,
                    UserId = s.UserId,
                    FullName = s.User.FullName,
                    Email = s.User.Email,
                    PhoneNumber = s.User.PhoneNumber ?? string.Empty,
                    StationId = s.StationId,
                    StationName = s.Station != null ? s.Station.StationName : "Chưa phân công"
                })
                .FirstOrDefaultAsync();

            if (staff == null)
            {
                return NotFound();
            }

            return staff;
        }

        // ===================================================================
        // 3. PUT (Logic AssignStaffToStation của Huy)
        // ===================================================================
        // PUT: api/Staffs/5
        // [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStaff(int id, StaffUpdateDto dto)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
            {
                return NotFound("Không tìm thấy nhân viên.");
            }

            // Logic kiểm tra Station tồn tại (của Huy)
            if (dto.StationId.HasValue)
            {
                var stationExists = await _context.Stations.AnyAsync(s => s.StationId == dto.StationId);
                if (!stationExists)
                {
                    return BadRequest($"Không tìm thấy trạm (Station) với ID: {dto.StationId}");
                }
            }

            // Cập nhật trạm làm việc
            staff.StationId = dto.StationId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StaffExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // ===================================================================
        // 4. POST (Tạo hồ sơ nhân viên cho 1 User có sẵn)
        // ===================================================================
        // POST: api/Staffs
        // [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<ActionResult<Staff>> PostStaff(StaffCreateDto dto)
        {
            // Validate: User có tồn tại không?
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return BadRequest("User ID không tồn tại.");

            // Validate: User này đã là Staff chưa?
            if (await _context.Staff.AnyAsync(s => s.UserId == dto.UserId))
            {
                return BadRequest("User này đã có hồ sơ nhân viên rồi.");
            }

            // Validate: Station
            if (dto.StationId.HasValue && !await _context.Stations.AnyAsync(s => s.StationId == dto.StationId))
            {
                return BadRequest("Station ID không tồn tại.");
            }

            var staff = new Staff
            {
                UserId = dto.UserId,
                StationId = dto.StationId
            };

            // Update Role của User thành STAFF luôn cho chắc
            user.Role = "STAFF";

            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStaff", new { id = staff.StaffId }, dto);
        }

        // ===================================================================
        // 5. DELETE (Thêm ràng buộc logic)
        // ===================================================================
        // DELETE: api/Staffs/5
        // [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
            {
                return NotFound();
            }

            // Rule: Kiểm tra xem nhân viên có đang phụ trách hợp đồng nào không?
            var hasContracts = await _context.Contracts.AnyAsync(c => c.StaffId == id);
            if (hasContracts)
            {
                return BadRequest("Không thể xóa nhân viên này vì họ đã ký các hợp đồng trong hệ thống.");
            }
            
            // Rule: Nếu xóa Staff, ta có nên xóa User không? -> KHÔNG. 
            // Chỉ chuyển Role User về RENTER hoặc BLOCKED tùy nghiệp vụ.
            // Ở đây tớ chỉ xóa hồ sơ Staff thôi.
            var user = await _context.Users.FindAsync(staff.UserId);
            if (user != null) 
            {
                user.Role = "RENTER"; // Reset role
            }

            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StaffExists(int id)
        {
            return _context.Staff.Any(e => e.StaffId == id);
        }
    }
}