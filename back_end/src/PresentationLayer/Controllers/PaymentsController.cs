using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.DTOs.Payment.VNPAY;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.Helpers.CurrentUserAccessor; // <-- (1) Import helper

namespace PresentationLayer.Controllers
{ 
    [Route("api/payments")]
    [ApiController]
    [Authorize] 
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentsService _paymentsService;
        private readonly ICurrentUserAccessor _currentUser; // <-- (2) Thêm field

        public PaymentsController(IPaymentsService paymentsService, ICurrentUserAccessor currentUser) // <-- (3) Inject
        {
            _paymentsService = paymentsService;
            _currentUser = currentUser; // <-- (4) Gán giá trị
        }

        // === 1. Endpoint "Ghi nợ" ===
        [HttpPost("add-charge")]
        [Authorize(Roles = "STAFF")]
        public async Task<IActionResult> AddCharge([FromBody] StaffAddChargeDto dto)
        {
            try
            {
                // (5) Sửa logic lấy StaffId
                var staffId = _currentUser.StaffId;
                if (staffId == null)
                {
                    throw new UnauthorizedAccessException("Token không hợp lệ hoặc không phải Staff.");
                }

                var newPaymentRecord = await _paymentsService.AddChargeAsync(dto, staffId.Value); // (Nhớ dùng .Value)
                
                return CreatedAtAction(nameof(GetPayments), new { orderId = newPaymentRecord.OrderId }, newPaymentRecord);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message }); }
        }

        // === 2. Endpoint "Xác nhận tiền mặt" ===
        [HttpPost("confirm-cash/{orderId}")]
        [Authorize(Roles = "STAFF")]
        public async Task<IActionResult> ConfirmCashPayment(int orderId)
        {
            try
            {
                // (5) Sửa logic lấy StaffId
                var staffId = _currentUser.StaffId;
                if (staffId == null)
                {
                    throw new UnauthorizedAccessException("Token không hợp lệ hoặc không phải Staff.");
                }

                var success = await _paymentsService.ConfirmCashPaymentAsync(orderId, staffId.Value);

                if (!success)
                {
                    return BadRequest(new { message = "Không tìm thấy khoản nào chưa thanh toán cho đơn hàng này." });
                }
                
                return Ok(new { message = "Tất cả các khoản đã được xác nhận thanh toán tiền mặt." });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message }); }
        }

        // === 3. Renter gọi để lấy link thanh toán MoMo ===
        [HttpPost("create-momo")]
        [Authorize(Roles = "RENTER")] 
        public async Task<IActionResult> CreateMoMoPayment([FromBody] PaymentInitiationDto dto)
        {
            try
            {
                // (5) Sửa logic lấy RenterId
                var renterId = _currentUser.RenterId;
                if (renterId == null)
                {
                    throw new UnauthorizedAccessException("Token không hợp lệ hoặc không phải Renter.");
                }

                var response = await _paymentsService.CreateMoMoPaymentRequestAsync(dto, renterId.Value);
                return Ok(response);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message }); }
        }

        // === 4. MoMo gọi (Webhook/IPN) (Giữ nguyên) ===
        [HttpPost("momo/ipn")]
        [AllowAnonymous] 
        public async Task<IActionResult> HandleMomoIpn([FromBody] MomoIpnDto payload)
        {
            try
            {
                await _paymentsService.ProcessMomoIpnAsync(payload);
                return NoContent(); 
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message }); 
            }
        }
        
        // === 5. Renter gọi để lấy link VNPAY ===
        [HttpPost("create-vnpay")]
        [Authorize(Roles = "RENTER")]
        public async Task<IActionResult> CreateVnpayPayment([FromBody] PaymentInitiationDto dto)
        {
            try
            {
                // (5) Sửa logic lấy RenterId
                var renterId = _currentUser.RenterId;
                if (renterId == null)
                {
                    throw new UnauthorizedAccessException("Token không hợp lệ hoặc không phải Renter.");
                }

                var response = await _paymentsService.CreateVnpayPaymentRequestAsync(dto, renterId.Value, HttpContext); 
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // === 6. VNPAY gọi (IPN) (Giữ nguyên) ===
        [HttpGet("vnpay/ipn")] 
        [AllowAnonymous]
        public async Task<IActionResult> HandleVnpayIpn([FromQuery] VnpayIpnDto ipnDto)
        {
            string responseMessage = await _paymentsService.ProcessVnpayIpnAsync(ipnDto);
            return Content(responseMessage, "application/json");
        }

        // === 7. Renter/Staff xem lịch sử thanh toán (Giữ nguyên) ===
        [HttpGet("order/{orderId}")]
        [Authorize(Roles = "RENTER, STAFF")]
        public async Task<IActionResult> GetPayments(int orderId)
        {
            var payments = await _paymentsService.GetPaymentsForOrderAsync(orderId);
            return Ok(payments);
        }        
    }
}