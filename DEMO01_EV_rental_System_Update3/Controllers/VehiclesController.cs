using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

// ===================================================================
// DTOs (Đặt ngay trong file Controller hoặc tách file tùy team)
// ===================================================================

// DTO tạo mới (Chứa các trường cần thiết để tạo xe)
public class VehicleCreateDto
{
    public string LicensePlate { get; set; } = string.Empty;
    public int VehicleModelId { get; set; }
    public int? StationId { get; set; }
    public int? ReleaseYear { get; set; }
    public int CurrentMileage { get; set; }
    public string? ImgCarUrl { get; set; }
    public string Condition { get; set; } = "GOOD"; // GOOD, IN_REPAIR, DAMAGED
    public decimal? BatteryCapacity { get; set; } // Trong DB của Nghĩa, cái này nằm ở Vehicle
}

// DTO cập nhật (Cho phép sửa trạng thái, vị trí, v.v.)
public class VehicleUpdateDto
{
    public int? StationId { get; set; } // Để update location
    public int CurrentMileage { get; set; }
    public string Condition { get; set; } = "GOOD"; // GOOD, IN_REPAIR, DAMAGED
    public bool IsAvailable { get; set; }
    public string? ImgCarUrl { get; set; }
}

// DTO hiển thị (Flatten dữ liệu để frontend dễ dùng)
public class VehicleViewDto
{
    public int VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty; // Lấy từ VehicleModel
    public string BrandName { get; set; } = string.Empty; // Lấy từ VehicleModel
    public string? StationName { get; set; } // Lấy từ Station
    public string Condition { get; set; } = "GOOD"; // GOOD, IN_REPAIR, DAMAGED
    public bool IsAvailable { get; set; }
    public decimal? BatteryCapacity { get; set; }
    public int CurrentMileage { get; set; }
    public string? ImgCarUrl { get; set; }
}

// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public VehiclesController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // ===================================================================
        // 1. GET ALL (Gộp Search, Filter, Paging của Huy)
        // ===================================================================
        // GET: api/Vehicles?search=29A&stationId=1&page=1
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult> GetVehicles(
            [FromQuery] string? search,
            [FromQuery] int? stationId,
            [FromQuery] int? modelId,
            [FromQuery] bool? isAvailable,
            [FromQuery] decimal? minBattery,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Logic "Include" để lấy thông tin Model và Station
            var query = _context.Vehicles
                .Include(v => v.VehicleModel)
                .Include(v => v.Station)
                .AsQueryable();

            // Filter theo logic của Huy
            if (!string.IsNullOrWhiteSpace(search))
            {
                // Tìm theo biển số
                query = query.Where(v => v.LicensePlate.Contains(search));
            }
            if (stationId.HasValue)
            {
                query = query.Where(v => v.StationId == stationId.Value);
            }
            if (modelId.HasValue)
            {
                query = query.Where(v => v.VehicleModelId == modelId.Value);
            }
            if (isAvailable.HasValue)
            {
                query = query.Where(v => v.IsAvailable == isAvailable.Value);
            }
            // Lưu ý: Trong Context của Nghĩa, BatteryCapacity nằm ở Vehicle
            if (minBattery.HasValue)
            {
                query = query.Where(v => v.BatteryCapacity >= minBattery.Value);
            }

            var totalItems = await query.CountAsync();

            var data = await query
                .OrderBy(v => v.LicensePlate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VehicleViewDto // Map sang DTO
                {
                    VehicleId = v.VehicleId,
                    LicensePlate = v.LicensePlate,
                    ModelName = v.VehicleModel.Model ?? string.Empty, // Context Nghĩa dùng "Model" thay vì "ModelName"
                    BrandName = v.VehicleModel.BrandName ?? string.Empty,
                    StationName = v.Station != null ? v.Station.StationName : "N/A",
                    Condition = v.Condition,
                    IsAvailable = v.IsAvailable,
                    BatteryCapacity = v.BatteryCapacity,
                    CurrentMileage = v.CurrentMileage,
                    ImgCarUrl = v.ImgCarUrl
                })
                .ToListAsync();

            return Ok(new { TotalItems = totalItems, Data = data });
        }

        // XÓA HÀM GetVehiclesByName của Nghĩa vì đã gộp vào hàm trên

        // ===================================================================
        // 2. GET BY ID (Trả về DTO đầy đủ)
        // ===================================================================
        // GET: api/Vehicles/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<VehicleViewDto>> GetVehicle(int id)
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.VehicleModel)
                .Include(v => v.Station)
                .Where(v => v.VehicleId == id)
                .Select(v => new VehicleViewDto
                {
                    VehicleId = v.VehicleId,
                    LicensePlate = v.LicensePlate,
                    ModelName = v.VehicleModel.Model ?? string.Empty,
                    BrandName = v.VehicleModel.BrandName ?? string.Empty,
                    StationName = v.Station != null ? v.Station.StationName : "N/A",
                    Condition = v.Condition,
                    IsAvailable = v.IsAvailable,
                    BatteryCapacity = v.BatteryCapacity,
                    CurrentMileage = v.CurrentMileage,
                    ImgCarUrl = v.ImgCarUrl
                })
                .FirstOrDefaultAsync();

            if (vehicle == null)
            {
                return NotFound();
            }

            return vehicle;
        }

        // ===================================================================
        // 3. POST (Thêm logic Check Trùng & Business Rule của Huy)
        // ===================================================================
        // POST: api/Vehicles
        [Authorize(Roles = "ADMIN")] // <-- Nên bật lại khi chạy thật
        [HttpPost]
        public async Task<ActionResult<VehicleViewDto>> PostVehicle(VehicleCreateDto dto)
        {
            // 1. Validate Biển số trùng (Rule của Huy)
            var normalizedPlate = dto.LicensePlate.Trim();
            if (await _context.Vehicles.AnyAsync(v => v.LicensePlate == normalizedPlate))
            {
                return BadRequest("Biển số xe này đã tồn tại trong hệ thống.");
            }

            // 2. Validate FK (Station & Model)
            if (!await _context.VehicleModels.AnyAsync(m => m.VehicleModelId == dto.VehicleModelId))
            {
                return BadRequest("Mẫu xe (Model ID) không tồn tại.");
            }
            if (dto.StationId.HasValue && !await _context.Stations.AnyAsync(s => s.StationId == dto.StationId))
            {
                return BadRequest("Trạm (Station ID) không tồn tại.");
            }

            // 3. Map DTO -> Entity
            var entity = new Vehicle
            {
                LicensePlate = normalizedPlate,
                VehicleModelId = dto.VehicleModelId,
                StationId = dto.StationId,
                ReleaseYear = dto.ReleaseYear,
                CurrentMileage = dto.CurrentMileage,
                ImgCarUrl = dto.ImgCarUrl,
                BatteryCapacity = dto.BatteryCapacity.HasValue ? (int?)dto.BatteryCapacity.Value : null,
                // Rule: Điều kiện xe
                Condition = dto.Condition
            };

            // Rule 3 & 5 của Huy: Tự động set IsAvailable dựa trên Condition
            if (entity.Condition == "IN_REPAIR" || entity.Condition == "DAMAGED")
            {
                entity.IsAvailable = false;
            }
            else
            {
                entity.Condition = "GOOD";
                entity.IsAvailable = true;
            }

            _context.Vehicles.Add(entity);
            await _context.SaveChangesAsync();

            // Trả về
            return CreatedAtAction(nameof(GetVehicle), new { id = entity.VehicleId }, dto);
        }

        // ===================================================================
        // 4. PUT (Gộp logic Update Location & Status của Huy)
        // ===================================================================
        // PUT: api/Vehicles/5
        [Authorize(Roles = "ADMIN, STAFF")] 
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVehicle(int id, VehicleUpdateDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }

            // 1. Validate Station nếu có thay đổi (Logic UpdateLocation của Huy)
            if (dto.StationId.HasValue && dto.StationId != vehicle.StationId)
            {
                if (!await _context.Stations.AnyAsync(s => s.StationId == dto.StationId))
                {
                    return BadRequest("Station ID mới không tồn tại.");
                }
                vehicle.StationId = dto.StationId;
            }

            // 2. Update thông tin khác
            vehicle.CurrentMileage = dto.CurrentMileage;
            vehicle.ImgCarUrl = dto.ImgCarUrl;
            
            // 3. Logic UpdateStatus của Huy (Consistency Check)
            vehicle.Condition = dto.Condition;
            
            if (vehicle.Condition == "IN_REPAIR" || vehicle.Condition == "DAMAGED")
            {
                // Nếu hỏng -> Bắt buộc ko available
                vehicle.IsAvailable = false;
            }
            else if (vehicle.Condition == "GOOD")
            {
                // Nếu tốt -> Cho phép set available theo ý Staff
                vehicle.IsAvailable = dto.IsAvailable;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VehicleExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // ===================================================================
        // 5. DELETE (Thêm logic check RentalOrder của Huy)
        // ===================================================================
        // DELETE: api/Vehicles/5
        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }

            // Rule 4 của Huy: Không xóa nếu đã có đơn thuê
            var hasOrders = await _context.RentalOrders.AnyAsync(o => o.VehicleId == id);
            if (hasOrders)
            {
                return BadRequest("Không thể xóa xe này vì đã có lịch sử thuê (Rental Orders).");
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VehicleExists(int id)
        {
            return _context.Vehicles.Any(e => e.VehicleId == id);
        }
    }
}