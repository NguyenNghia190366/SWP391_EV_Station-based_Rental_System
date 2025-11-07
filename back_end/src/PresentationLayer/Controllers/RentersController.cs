using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.Renter;
using System.Security.Claims;

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
                // 3. Lấy userId từ hàm helper
                int userId = GetCurrentUserId(); 
                var data = await _renterService.GetMyDocumentsAsync(userId);
                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPut("me/documents")]
        public async Task<IActionResult> UpsertMyDocuments([FromBody] RenterDocumentsUpsertDto dto)
        {
            try
            {
                // 3. Lấy userId từ hàm helper
                int userId = GetCurrentUserId();
                var data = await _renterService.UpsertMyDocumentsAsync(userId, dto);
                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // Hàm helper để lấy UserId từ Claims
        private int GetCurrentUserId()
        {
            // Thông thường, ID của user được lưu trong 'NameIdentifier'
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                // Nếu [Authorize] đã chạy, về lý thuyết không thể vào đây,
                // nhưng kiểm tra cẩn thận vẫn tốt hơn.
                throw new UnauthorizedAccessException("Token không hợp lệ, không tìm thấy User ID.");
            }

            if (int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }

            // Lỗi nghiêm trọng: Claim tồn tại nhưng giá trị không phải là số
            throw new UnauthorizedAccessException("User ID trong token không phải là một số hợp lệ.");
        }
    }
}