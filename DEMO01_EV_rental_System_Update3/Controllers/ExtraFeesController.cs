using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

// ===================================================================
// DTOs cho ExtraFee (Khoản phí phát sinh thực tế)
// ===================================================================
public class ExtraFeeCreateDto
{
    public int OrderId { get; set; }
    public int FeeTypeId { get; set; } // Staff chọn loại phí (Vệ sinh, Hỏng hóc...)
    public decimal? Amount { get; set; } // Nếu null -> Lấy giá mặc định của FeeType
    public string? Description { get; set; }
}

public class ExtraFeeUpdateDto
{
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class ExtraFeeViewDto
{
    public int FeeId { get; set; }
    public int OrderId { get; set; }
    public string FeeTypeName { get; set; } = string.Empty; // Tên loại phí
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExtraFeesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public ExtraFeesController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/ExtraFees/ByOrder/5 (Lấy tất cả phí của 1 đơn hàng)
        [HttpGet("ByOrder/{orderId}")]
        public async Task<ActionResult<IEnumerable<ExtraFeeViewDto>>> GetExtraFeesByOrder(int orderId)
        {
            var list = await _context.ExtraFees
                .Include(e => e.FeeType) // Include bảng cha để lấy tên
                .Where(e => e.OrderId == orderId)
                .Select(e => new ExtraFeeViewDto
                {
                    FeeId = e.FeeId,
                    OrderId = e.OrderId,
                    FeeTypeName = e.FeeType.FeeType1, // Lấy tên loại phí
                    Amount = e.Amount,
                    Description = e.Description,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(list);
        }

        // POST: api/ExtraFees (Tạo khoản phí mới cho đơn hàng)
        [HttpPost]
        public async Task<ActionResult<ExtraFeeViewDto>> PostExtraFee(ExtraFeeCreateDto dto)
        {
            // 1. Validate Order tồn tại
            var orderExists = await _context.RentalOrders.AnyAsync(o => o.OrderId == dto.OrderId);
            if (!orderExists) return BadRequest("Order ID không tồn tại.");

            // 2. Validate FeeType tồn tại & Lấy giá mặc định
            var feeType = await _context.FeeTypes.FindAsync(dto.FeeTypeId);
            if (feeType == null) return BadRequest("Loại phí (FeeType ID) không tồn tại.");

            // 3. Logic tính tiền: Nếu DTO không gửi Amount -> Lấy giá gốc từ FeeType
            decimal finalAmount = dto.Amount ?? feeType.Amount;

            // 4. Tạo Entity
            var extraFee = new ExtraFee
            {
                OrderId = dto.OrderId,
                FeeTypeId = dto.FeeTypeId,
                Amount = finalAmount,
                Description = dto.Description,
                // FeeName (Trong DB có cột này) -> Nên lưu tên FeeType vào để snapshot
                FeeName = feeType.FeeType1, 
                CreatedAt = DateTime.UtcNow
            };

            _context.ExtraFees.Add(extraFee);
            await _context.SaveChangesAsync();

            // 5. Trả về
            var viewDto = new ExtraFeeViewDto
            {
                FeeId = extraFee.FeeId,
                OrderId = extraFee.OrderId,
                FeeTypeName = feeType.FeeType1,
                Amount = extraFee.Amount,
                Description = extraFee.Description,
                CreatedAt = extraFee.CreatedAt
            };

            return CreatedAtAction(nameof(GetExtraFeesByOrder), new { orderId = extraFee.OrderId }, viewDto);
        }

        // PUT: api/ExtraFees/5 (Chỉ cho sửa tiền và mô tả)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExtraFee(int id, ExtraFeeUpdateDto dto)
        {
            var extraFee = await _context.ExtraFees.FindAsync(id);
            if (extraFee == null) return NotFound();

            extraFee.Amount = dto.Amount;
            extraFee.Description = dto.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/ExtraFees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExtraFee(int id)
        {
            var extraFee = await _context.ExtraFees.FindAsync(id);
            if (extraFee == null) return NotFound();

            _context.ExtraFees.Remove(extraFee);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}