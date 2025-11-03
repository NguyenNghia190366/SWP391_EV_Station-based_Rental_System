using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.ExtraFee;
using BusinessLogicLayer.DTOs.FeeType;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/extras")]
    [ApiController]
    public class ExtrasController : ControllerBase
    {
        private readonly IExtrasService _extrasService;

        public ExtrasController(IExtrasService extrasService)
        {
            _extrasService = extrasService;
        }

        // --- Dành cho Staff (hoặc Renter) xem phí của đơn hàng ---
        [HttpGet("order/{orderId}")]
        [Authorize(Roles = "Staff, Renter")] // [cite: 21]
        public async Task<IActionResult> GetFeesForOrder(int orderId)
        {
            var fees = await _extrasService.GetExtraFeesForOrderAsync(orderId);
            return Ok(fees);
        }

        // --- Dành cho Staff thêm/xóa phí ---
        [HttpPost]
        [Authorize(Roles = "Staff")] // [cite: 21]
        public async Task<IActionResult> AddExtraFee([FromBody] ExtraFeeCreateDto dto)
        {
            // var newFee = await _extrasService.AddExtraFeeToOrderAsync(dto);
            // return CreatedAtAction(nameof(GetFeesForOrder), new { orderId = newFee.OrderId }, newFee);
            try
            {
                var newFee = await _extrasService.AddExtraFeeToOrderAsync(dto);
                // 201 Created
                return CreatedAtAction(nameof(GetFeesForOrder), new { orderId = newFee.OrderId }, newFee);
            }
            catch (KeyNotFoundException ex)
            {
                // 404 Not Found
                return NotFound(new { message = ex.Message }); 
            }
            catch (InvalidOperationException ex)
            {
                // 400 Bad Request
                return BadRequest(new { message = ex.Message }); 
            }
            catch (Exception ex)
            {
                // 500 Internal Server Error (cho các lỗi khác)
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message }); 
            }
        }

        [HttpDelete("{feeId}")]
        [Authorize(Roles = "Staff")] 
        public async Task<IActionResult> DeleteExtraFee(int feeId)
        {
            await _extrasService.DeleteExtraFeeAsync(feeId);
            return NoContent();
        }
        
        // --- Dành cho Admin quản lý các loại phí (FeeType) ---
        [HttpGet("fee-types")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetAllFeeTypes()
        {
            return Ok(await _extrasService.GetAllFeeTypesAsync());
        }

        [HttpPost("fee-types")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateFeeType([FromBody] FeeTypeCreateDto dto)
        {
            return CreatedAtAction(nameof(GetAllFeeTypes),
                await _extrasService.CreateFeeTypeAsync(dto));
        }


        // ... (PUT và DELETE cho fee-types) ...
        [HttpPut("fee-types/{feeTypeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateFeeType(int feeTypeId, [FromBody] FeeTypeUpdateDto dto)
        {
            await _extrasService.UpdateFeeTypeAsync(feeTypeId, dto);
            return NoContent();
        }
        
        [HttpDelete("fee-types/{feeTypeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFeeType(int feeTypeId)
        {
            // await _extrasService.DeleteFeeTypeAsync(feeTypeId);
            // return NoContent();
            try
            {
                await _extrasService.DeleteFeeTypeAsync(feeTypeId);
                // 204 No Content
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                // 404 Not Found
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // 400 Bad Request (do đang được sử dụng)
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message }); 
            }
        }
    }
}