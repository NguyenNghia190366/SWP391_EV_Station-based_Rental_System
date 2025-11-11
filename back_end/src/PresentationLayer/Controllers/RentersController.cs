using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.Renter;

namespace PresentationLayer.Controllers
{
    [ApiController] 
    [Route("api/renters")] 
    [Authorize(Roles = "RENTER")] 
    public class RentersController : ControllerBase
    {
        private readonly IRenterService _renterService;

        public RentersController(IRenterService renterService)
        {
            _renterService = renterService;
        }

        [HttpGet("me/documents")]
        public async Task<IActionResult> GetMyDocuments()
        {
            try
            {
                // === SỬA: Bỏ logic GetCurrentUserId() ===
                var data = await _renterService.GetMyDocumentsAsync(); // <-- Không cần userId
                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException) // Bắt lỗi mới từ Service
            {
                return NotFound(new { message = "Không tìm thấy thông tin Renter." });
            }
        }

        [HttpPut("me/documents")]
        public async Task<IActionResult> UpsertMyDocuments([FromBody] RenterDocumentsUpsertDto dto)
        {
            try
            {
                // === SỬA: Bỏ logic GetCurrentUserId() ===
                var data = await _renterService.UpsertMyDocumentsAsync(dto); // <-- Không cần userId
                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException) // Bắt lỗi mới từ Service
            {
                return NotFound(new { message = "Không tìm thấy thông tin Renter." });
            }
        }
    }
}