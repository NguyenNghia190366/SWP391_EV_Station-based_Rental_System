using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data.CurrentUserAccessor;

// ===================================================================
// DTOs
// ===================================================================

public class PaymentChargeDto
{
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class PaymentViewDto
{
    public int PaymentId { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string FeeType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentssController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;
        private readonly ICurrentUserAccessor _currentUserAccessor;

        public PaymentssController(RentalEvSystemFinalContext context, ICurrentUserAccessor currentUserAccessor)
        {
            _context = context;
            _currentUserAccessor = currentUserAccessor;
        }

        // ===================================================================
        // 1. GET ALL
        // ===================================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
        {
            return await _context.Payments
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        // ===================================================================
        // 2. GET BY ID
        // ===================================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(x => x.PaymentId == id);
            if (payment == null) return NotFound();
            return payment;
        }

        // ===================================================================
        // 3. GET BY RENTER ID
        // ===================================================================
        [HttpGet("renter/{renter_id}")]
        public async Task<ActionResult<IEnumerable<PaymentViewDto>>> GetPaymentByRenterId(int renter_id)
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                .Where(p => p.Order.RenterId == renter_id)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentViewDto 
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentStatus = p.PaymentStatus,
                    FeeType = p.Type_payment, // Dùng cột Type_payment
                    
                    // [FIX]: Map Description vào ExternalRef (vì DB ko có cột Description)
                    Description = p.ExternalRef ?? string.Empty, 
                    
                    CreatedAt = p.PaymentDate
                })
                .ToListAsync();

            return Ok(payments);
        }

        // ===================================================================
        // 4. STAFF TẠO KHOẢN THU 
        // ===================================================================
        [HttpPost("AddCharge")]
        // [Authorize(Roles = "STAFF, ADMIN")]
        public async Task<ActionResult<Payment>> AddCharge(PaymentChargeDto dto)
        {
            var order = await _context.RentalOrders.FindAsync(dto.OrderId);
            if (order == null) return NotFound("Đơn hàng không tồn tại.");

            var payment = new Payment
            {
                OrderId = dto.OrderId,
                Amount = dto.Amount,
                PaymentMethod = "Cash",
                PaymentStatus = "UNPAID",
                Type_payment = "PAY_BONUS_FEE",
                PaymentDate = DateTime.UtcNow,
                
                // [FIX]: Lưu mô tả vào ExternalRef
                ExternalRef = dto.Description 
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPayment), new { id = payment.PaymentId }, payment);
        }

        // ===================================================================
        // 5. STAFF XÁC NHẬN TIỀN MẶT (Fix lỗi Property)
        // ===================================================================
        [HttpPut("ConfirmCash/{id}")]
        public async Task<IActionResult> ConfirmCash(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null) return NotFound();

            if (payment.PaymentStatus == "PAID")
                return BadRequest("Khoản này đã được thanh toán rồi.");

            payment.PaymentStatus = "PAID";
            payment.PaymentMethod = "Cash";
            
            // [FIX]: Lưu log staff vào ExternalRef
            var staffId = _currentUserAccessor.StaffId;
            payment.ExternalRef += $" (Confirmed by Staff #{staffId})";

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ===================================================================
        // 6. HOÀN TIỀN (Fix logic lấy số tiền cọc)
        // ===================================================================
        [HttpPost("RequestRefund/{orderId}")]
        public async Task<IActionResult> RequestRefund(int orderId)
        {
            var order = await _context.RentalOrders.FindAsync(orderId);
            if (order == null) return NotFound();

            // 1. Tìm lại giao dịch ĐÃ ĐẶT CỌC trước đó để lấy số tiền
            var depositPayment = await _context.Payments
                .Where(p => p.OrderId == orderId && 
                            p.Type_payment == "PAY" && 
                            p.PaymentStatus == "PAID")
                .FirstOrDefaultAsync();

            if (depositPayment == null) 
                return BadRequest("Đơn hàng này chưa đặt cọc, không thể hoàn tiền.");

            // 2. Check xem đã yêu cầu hoàn chưa
            bool alreadyRequested = await _context.Payments.AnyAsync(p => 
                p.OrderId == orderId && 
                p.Type_payment == "REFUND");
            
            if (alreadyRequested) return BadRequest("Đơn hàng này đã có yêu cầu hoàn tiền rồi.");

            // 3. Tạo yêu cầu hoàn tiền
            var refund = new Payment
            {
                OrderId = orderId,
                
                // [FIX]: Lấy đúng số tiền đã cọc từ giao dịch cũ
                Amount = depositPayment.Amount, 
                
                PaymentMethod = "E-Wallet",
                PaymentStatus = "UNPAID", // Chờ duyệt
                Type_payment = "REFUND",
                PaymentDate = DateTime.UtcNow,
                
                // [FIX]: Lưu ghi chú vào ExternalRef
                ExternalRef = "Yêu cầu hoàn cọc do hủy đơn."
            };

            _context.Payments.Add(refund);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã tạo yêu cầu hoàn tiền thành công." });
        }
    }
}