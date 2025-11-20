using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities; // Entity của Nghĩa
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

// ===================================================================
// DTOs
// ===================================================================

public class StationCreateDto
{
    public string StationName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Latitude { get; set; } // Context Nghĩa dùng decimal
    public decimal? Longitude { get; set; }
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE
    public int Capacity { get; set; }
}

public class StationUpdateDto
{
    public string StationName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public int Capacity { get; set; }
}

public class StationViewDto
{
    public int StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public int Capacity { get; set; }
    // Bonus logic: Đếm số lượng xe đang ở trạm
    public int CurrentVehiclesCount { get; set; }
}

// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StationsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public StationsController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // ===================================================================
        // 1. GET ALL (Gộp Search, Filter, Paging của Huy)
        // ===================================================================
        // GET: api/Stations?search=Vin&page=1&pageSize=10
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetStations(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Stations.AsNoTracking(); // Tối ưu đọc dữ liệu

            // Logic tìm kiếm của Huy
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                query = query.Where(s => 
                    s.StationName.ToLower().Contains(searchTerm) || 
                    s.Address.ToLower().Contains(searchTerm));
            }

            // Đếm tổng
            var totalItems = await query.CountAsync();

            // Lấy dữ liệu & Map sang ViewDto
            var data = await query
                .OrderByDescending(s => s.StationId) // Mới nhất lên đầu
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new StationViewDto
                {
                    StationId = s.StationId,
                    StationName = s.StationName,
                    Address = s.Address,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    Status = s.Status,
                    Capacity = s.Capacity,
                    // Đếm xe đang đậu ở trạm này
                    CurrentVehiclesCount = s.Vehicles.Count()
                })
                .ToListAsync();

            return Ok(new { TotalItems = totalItems, Data = data });
        }

        // ===================================================================
        // 2. GET BY ID
        // ===================================================================
        // GET: api/Stations/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<StationViewDto>> GetStation(int id)
        {
            var station = await _context.Stations
                .AsNoTracking()
                .Where(s => s.StationId == id)
                .Select(s => new StationViewDto
                {
                    StationId = s.StationId,
                    StationName = s.StationName,
                    Address = s.Address,
                    Latitude = s.Latitude,
                    Longitude = s.Longitude,
                    Status = s.Status,
                    Capacity = s.Capacity,
                    CurrentVehiclesCount = s.Vehicles.Count()
                })
                .FirstOrDefaultAsync();

            if (station == null)
            {
                return NotFound();
            }

            return station;
        }

        // ===================================================================
        // 3. POST (Dùng DTO để bảo mật)
        // ===================================================================
        // POST: api/Stations
        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<ActionResult<StationViewDto>> PostStation(StationCreateDto dto)
        {
            // Map DTO -> Entity
            var station = new Station
            {
                StationName = dto.StationName,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Status = dto.Status ?? "ACTIVE",
                Capacity = dto.Capacity,
                // CreatedAt thường DB tự sinh hoặc gán UTC
                CreatedAt = DateTime.UtcNow 
            };

            _context.Stations.Add(station);
            await _context.SaveChangesAsync();

            // Trả về ViewDto
            var viewDto = new StationViewDto
            {
                StationId = station.StationId,
                StationName = station.StationName,
                Address = station.Address,
                Latitude = station.Latitude,
                Longitude = station.Longitude,
                Status = station.Status,
                Capacity = station.Capacity,
                CurrentVehiclesCount = 0
            };

            return CreatedAtAction(nameof(GetStation), new { id = station.StationId }, viewDto);
        }

        // ===================================================================
        // 4. PUT (Dùng DTO + Validate)
        // ===================================================================
        // PUT: api/Stations/5
        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStation(int id, StationUpdateDto dto)
        {
            var station = await _context.Stations.FindAsync(id);
            
            if (station == null)
            {
                return NotFound();
            }

            // Map fields thủ công
            station.StationName = dto.StationName;
            station.Address = dto.Address;
            station.Latitude = dto.Latitude;
            station.Longitude = dto.Longitude;
            station.Status = dto.Status;
            station.Capacity = dto.Capacity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StationExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // ===================================================================
        // 5. DELETE (Thêm logic check ràng buộc dữ liệu)
        // ===================================================================
        // DELETE: api/Stations/5
        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStation(int id)
        {
            var station = await _context.Stations.FindAsync(id);
            if (station == null)
            {
                return NotFound();
            }

            // Rule: Không xóa trạm nếu đang có xe đậu
            bool hasVehicles = await _context.Vehicles.AnyAsync(v => v.StationId == id);
            if (hasVehicles)
            {
                return BadRequest("Không thể xóa trạm vì đang có xe đậu tại đây.");
            }

            // Rule: Không xóa trạm nếu có nhân viên trực thuộc
            bool hasStaff = await _context.Staff.AnyAsync(s => s.StationId == id);
            if (hasStaff)
            {
                return BadRequest("Không thể xóa trạm vì đang có nhân viên làm việc tại đây.");
            }

            // Rule: Không xóa trạm nếu dính líu tới đơn hàng (Pickup/Return)
            bool hasOrders = await _context.RentalOrders.AnyAsync(o => o.PickupStationId == id || o.ReturnStationId == id);
            if (hasOrders)
            {
                return BadRequest("Không thể xóa trạm vì đã có lịch sử giao dịch (đơn thuê xe) tại đây.");
            }

            _context.Stations.Remove(station);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StationExists(int id)
        {
            return _context.Stations.Any(e => e.StationId == id);
        }
    }
}