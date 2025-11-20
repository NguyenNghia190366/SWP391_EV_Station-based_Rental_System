using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data; // <-- Context của Nghĩa
using DEMO01_EV_rental_System.Entities; // <-- Entity của Nghĩa
using Microsoft.AspNetCore.Authorization;
using System.Linq; // <-- Thêm LINQ

// ===================================================================
// CÁC DTOs (Dựa trên RentalEvSystemFinalContext của Nghĩa)
// Cậu copy 3 class DTO này vào project của Nghĩa
// ===================================================================

// DTO cho việc TẠO MỚI (Chỉ chứa các trường Nghĩa có)
public class VehicleModelCreateDto
{
    public string Model { get; set; } = string.Empty; // Property "Model" của Nghĩa
    public string BrandName { get; set; } = string.Empty;   
    public string? VehicleColor { get; set; }
    public int NumberOfSeats { get; set; }
    public int? Mileage { get; set; }
    public decimal price_per_hour { get; set; } // Property "price_per_hour" của Nghĩa
}

// DTO cho việc CẬP NHẬT
public class VehicleModelUpdateDto
{
    public string Model { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string? VehicleColor { get; set; }
    public int NumberOfSeats { get; set; }
    public int? Mileage { get; set; }
    public decimal price_per_hour { get; set; }
}

// DTO cho việc HIỂN THỊ
public class VehicleModelViewDto
{
    public int VehicleModelId { get; set; }
    public string Model { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string? VehicleColor { get; set; }
    public int NumberOfSeats { get; set; }
    public int? Mileage { get; set; }
    public decimal price_per_hour { get; set; }
    public int VehiclesCount { get; set; } // <-- Logic của Huy
}

// ===================================================================
// HẾT PHẦN DTO
// ===================================================================


namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleModelsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public VehicleModelsController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // ===================================================================
        // 1. SỬA HÀM GET ALL (Gộp logic của Huy: Search + Paging + DTO)
        // ===================================================================
        // GET: api/VehicleModels
        [HttpGet]
        [AllowAnonymous] // Giữ AllowAnonymous của Nghĩa
        public async Task<ActionResult> GetVehicleModels(
            [FromQuery] string? search, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            // Logic lấy từ service của Huy (hiệu suất cao)
            var query = _context.VehicleModels.AsQueryable(); // <-- DbSet của Nghĩa

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim().ToLower();
                // Dùng property "BrandName" và "Model" của Nghĩa
                query = query.Where(vm => 
                    (vm.BrandName != null && vm.BrandName.ToLower().Contains(searchTerm)) || 
                    (vm.Model != null && vm.Model.ToLower().Contains(searchTerm)) 
                );
            }

            var totalItems = await query.CountAsync();
            var data = await query
                .OrderBy(vm => vm.BrandName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(vm => new VehicleModelViewDto // <-- Map sang DTO thủ công
                {
                    VehicleModelId = vm.VehicleModelId,
                    BrandName = vm.BrandName,
                    Model = vm.Model ?? string.Empty,
                    VehicleColor = vm.VehicleColor,
                    NumberOfSeats = vm.NumberOfSeats,
                    Mileage = vm.Mileage,
                    price_per_hour = vm.price_per_hour,
                    // Dùng DbSet "Vehicles" của Nghĩa
                    VehiclesCount = vm.Vehicles.Count() // <-- Logic của Huy
                })
                .ToListAsync();

            return Ok(new { TotalItems = totalItems, Data = data });
        }
        
        // (Xóa hàm GetVehicleModelsByName của Nghĩa vì đã gộp)

        // ===================================================================
        // 2. SỬA HÀM GET BY ID (Trả về DTO - Logic của Huy)
        // ===================================================================
        // GET: api/VehicleModels/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<VehicleModelViewDto>> GetVehicleModel(int id)
        {
            var vehicleModel = await _context.VehicleModels // <-- DbSet của Nghĩa
                .Where(vm => vm.VehicleModelId == id)
                .Select(vm => new VehicleModelViewDto // <-- Map sang DTO
                {
                    VehicleModelId = vm.VehicleModelId,
                    BrandName = vm.BrandName,
                    Model = vm.Model ?? string.Empty,
                    VehicleColor = vm.VehicleColor,
                    NumberOfSeats = vm.NumberOfSeats,
                    Mileage = vm.Mileage,
                    price_per_hour = vm.price_per_hour,
                    VehiclesCount = vm.Vehicles.Count()
                })
                .FirstOrDefaultAsync();

            if (vehicleModel == null)
            {
                return NotFound();
            }

            return vehicleModel;
        }

        // ===================================================================
        // 3. SỬA HÀM PUT (Dùng DTO + logic validate của Huy)
        // ===================================================================
        // PUT: api/VehicleModels/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVehicleModel(int id, VehicleModelUpdateDto dto)
        {
            // Sửa logic của Nghĩa (bỏ check `id != vehicleModel.VehicleModelId`)
            var entity = await _context.VehicleModels.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            // Logic validate của Huy
            var normalizedBrand = dto.BrandName.Trim();
            var normalizedModel = dto.Model.Trim();

            // Check unique (dùng property của Nghĩa)
            if (entity.BrandName.ToLower() != normalizedBrand.ToLower() ||
                (entity.Model != null && entity.Model.ToLower() != normalizedModel.ToLower()))
            {
                var exists = await _context.VehicleModels.AnyAsync(vm =>
                    vm.BrandName.ToLower() == normalizedBrand.ToLower() &&
                    vm.Model != null && vm.Model.ToLower() == normalizedModel.ToLower() &&
                    vm.VehicleModelId != id // <-- Logic của Huy
                );

                if (exists)
                {
                    return BadRequest("Đã tồn tại mẫu xe khác với cùng thương hiệu và tên mẫu.");
                }
            }

            // Map thủ công DTO vào entity (tránh over-posting)
            entity.BrandName = normalizedBrand;
            entity.Model = normalizedModel;
            entity.VehicleColor = dto.VehicleColor;
            entity.NumberOfSeats = dto.NumberOfSeats;
            entity.Mileage = dto.Mileage;
            entity.price_per_hour = dto.price_per_hour;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VehicleModelExists(id))
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

        // ===================================================================
        // 4. SỬA HÀM POST (Dùng DTO + logic validate của Huy)
        // ===================================================================
        // POST: api/VehicleModels
        [HttpPost]
        public async Task<ActionResult<VehicleModelViewDto>> PostVehicleModel(VehicleModelCreateDto dto)
        {
            // Logic validate của Huy
            var normalizedBrand = dto.BrandName.Trim();
            var normalizedModel = dto.Model.Trim();

            var exists = await _context.VehicleModels.AnyAsync(vm => 
                vm.BrandName.ToLower() == normalizedBrand.ToLower() &&
                vm.Model != null && vm.Model.ToLower() == normalizedModel.ToLower()
            );
            
            if (exists)
            {
                return BadRequest("Mẫu xe với thương hiệu và tên mẫu này đã tồn tại.");
            }

            // Map thủ công DTO sang entity (tránh over-posting)
            var entity = new VehicleModel // <-- Entity của Nghĩa
            {
                BrandName = normalizedBrand,
                Model = normalizedModel,
                VehicleColor = dto.VehicleColor,
                NumberOfSeats = dto.NumberOfSeats,
                Mileage = dto.Mileage,
                price_per_hour = dto.price_per_hour
            };

            _context.VehicleModels.Add(entity);
            await _context.SaveChangesAsync();

            // Map lại sang ViewDto để trả về (đã bao gồm ID)
            var viewDto = new VehicleModelViewDto
            {
                VehicleModelId = entity.VehicleModelId, // <-- Lấy ID vừa tạo
                BrandName = entity.BrandName,
                Model = entity.Model,
                VehicleColor = entity.VehicleColor,
                NumberOfSeats = entity.NumberOfSeats,
                Mileage = entity.Mileage,
                price_per_hour = entity.price_per_hour,
                VehiclesCount = 0 // Mới tạo nên = 0
            };

            return CreatedAtAction(nameof(GetVehicleModel), new { id = entity.VehicleModelId }, viewDto);
        }

        // ===================================================================
        // 5. SỬA HÀM DELETE (Thêm logic validate của Huy)
        // ===================================================================
        // DELETE: api/VehicleModels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicleModel(int id)
        {
            // Logic validate của Huy (check xe liên quan)
            // Dùng DbSet "Vehicles" của Nghĩa
            var hasVehicles = await _context.Vehicles 
                .AnyAsync(v => v.VehicleModelId == id);

            if (hasVehicles)
            {
                return BadRequest("Không thể xóa mẫu xe này vì vẫn còn xe đang sử dụng.");
            }

            // Logic delete của Nghĩa
            var vehicleModel = await _context.VehicleModels.FindAsync(id);
            if (vehicleModel == null)
            {
                return NotFound();
            }

            _context.VehicleModels.Remove(vehicleModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 6. Hàm Exists của Nghĩa (Giữ nguyên)
        private bool VehicleModelExists(int id)
        {
            return _context.VehicleModels.Any(e => e.VehicleModelId == id);
        }
    }
}