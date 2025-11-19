using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

// ===================================================================
// DTOs cho FeeType (Loại phí)
// ===================================================================
public class FeeTypeCreateDto
{
    public string FeeTypeName { get; set; } = string.Empty; // Map vào FeeType1
    public decimal Amount { get; set; }
}

public class FeeTypeUpdateDto
{
    public string FeeTypeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class FeeTypeViewDto
{
    public int FeeTypeId { get; set; }
    public string FeeTypeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN")] 
    public class FeeTypesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public FeeTypesController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/FeeTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeeTypeViewDto>>> GetFeeTypes()
        {
            return await _context.FeeTypes
                .AsNoTracking()
                .Select(f => new FeeTypeViewDto 
                {
                    FeeTypeId = f.FeeTypeId,
                    FeeTypeName = f.FeeType1, // Lưu ý: DB của Nghĩa tên cột là FeeType1
                    Amount = f.Amount
                })
                .ToListAsync();
        }

        // GET: api/FeeTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FeeTypeViewDto>> GetFeeType(int id)
        {
            var feeType = await _context.FeeTypes.FindAsync(id);

            if (feeType == null) return NotFound();

            return new FeeTypeViewDto
            {
                FeeTypeId = feeType.FeeTypeId,
                FeeTypeName = feeType.FeeType1,
                Amount = feeType.Amount
            };
        }

        // POST: api/FeeTypes
        // [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<ActionResult<FeeTypeViewDto>> PostFeeType(FeeTypeCreateDto dto)
        {
            // 1. Validate Logic (Của Huy): Tên không được trùng
            var normalizedName = dto.FeeTypeName.Trim();
            var exists = await _context.FeeTypes.AnyAsync(f => f.FeeType1 == normalizedName);
            
            if (exists)
            {
                return BadRequest("Loại phí với tên này đã tồn tại.");
            }

            // 2. Map DTO -> Entity
            var feeType = new FeeType
            {
                FeeType1 = normalizedName,
                Amount = dto.Amount
            };

            _context.FeeTypes.Add(feeType);
            await _context.SaveChangesAsync();

            // 3. Trả về
            var viewDto = new FeeTypeViewDto
            {
                FeeTypeId = feeType.FeeTypeId,
                FeeTypeName = feeType.FeeType1,
                Amount = feeType.Amount
            };

            return CreatedAtAction(nameof(GetFeeType), new { id = feeType.FeeTypeId }, viewDto);
        }

        // PUT: api/FeeTypes/5
        // [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFeeType(int id, FeeTypeUpdateDto dto)
        {
            var feeType = await _context.FeeTypes.FindAsync(id);
            if (feeType == null) return NotFound();

            // 1. Validate Logic (Của Huy): Check trùng tên (trừ chính nó)
            var normalizedName = dto.FeeTypeName.Trim();
            if (feeType.FeeType1 != normalizedName)
            {
                var exists = await _context.FeeTypes.AnyAsync(f => f.FeeType1 == normalizedName);
                if (exists) return BadRequest("Tên loại phí này đã được sử dụng.");
            }

            // 2. Update
            feeType.FeeType1 = normalizedName;
            feeType.Amount = dto.Amount;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/FeeTypes/5
        // [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeeType(int id)
        {
            var feeType = await _context.FeeTypes.FindAsync(id);
            if (feeType == null) return NotFound();

            // Validate: Nếu loại phí này đã được dùng trong ExtraFee thì không được xóa (tránh lỗi FK)
            var isUsed = await _context.ExtraFees.AnyAsync(e => e.FeeTypeId == id);
            if (isUsed)
            {
                return BadRequest("Không thể xóa loại phí này vì đã có hóa đơn sử dụng nó.");
            }

            _context.FeeTypes.Remove(feeType);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}