using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{ 
    [Route("api/payments")]
    [ApiController]
    
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentsService _paymentsService;

        public PaymentsController(IPaymentsService paymentsService)
        {
            _paymentsService = paymentsService;
        }

        // 1. Renter gọi để lấy link thanh toán
        [HttpPost("create-momo")]
        [Authorize(Roles = "RENTER")] // Chỉ Renter
        public async Task<IActionResult> CreateMoMoPayment([FromBody] PaymentInitiationDto dto)
        {
            try
            {
                // Lấy RenterId từ Token (HttpContext.User)
                // Giả sử cậu lưu RenterId trong Claim "RenterId"
                var renterIdClaim = User.Claims.FirstOrDefault(c => c.Type == "RenterId"); 
                if (renterIdClaim == null)
                {
                    return Unauthorized("Token không hợp lệ hoặc không phải Renter.");
                }
                
                int renterId = int.Parse(renterIdClaim.Value);

                var response = await _paymentsService.CreateMoMoPaymentRequestAsync(dto, renterId);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // 2. MoMo gọi (Webhook/IPN)
        [HttpPost("momo/ipn")]
        [AllowAnonymous] // Phải AllowAnonymous vì đây là server MoMo gọi
        public async Task<IActionResult> HandleMomoIpn([FromBody] MomoIpnDto payload)
        {
            // Đây là endpoint đã khai báo trong appsettings.json
            try
            {
                await _paymentsService.ProcessMomoIpnAsync(payload);
                
                // Phải trả về 204 (NoContent) hoặc 200 (Ok)
                // để MoMo biết là đã nhận thành công và không gửi lại nữa.
                return NoContent(); 
            }
            catch (Exception ex)
            {
                // Nếu lỗi, trả về 400/500 để MoMo biết và thử gửi lại IPN
                return BadRequest(new { message = ex.Message });
            }
        }

        // 3. Renter/Staff xem lịch sử thanh toán
        [HttpGet("order/{orderId}")]
        [Authorize(Roles = "RENTER, STAFF")]
        public async Task<IActionResult> GetPayments(int orderId)
        {
            var payments = await _paymentsService.GetPaymentsForOrderAsync(orderId);
            return Ok(payments);
        }
    }
}