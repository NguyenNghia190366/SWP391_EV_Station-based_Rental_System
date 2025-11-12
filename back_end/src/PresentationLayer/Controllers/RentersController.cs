using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.Renter;

namespace PresentationLayer.Controllers
{
    [ApiController] 
    [Route("api/renters")] 
    [Authorize] 
    public class RentersController : ControllerBase
    {
        private readonly IRenterService _renterService;

        public RentersController(IRenterService renterService)
        {
            _renterService = renterService;
        }
        // HÀM XEM GIẤY TỜ CỦA CHÍNH MÌNH VỚI RENTER ROLE
        [Authorize(Roles = "RENTER")]
        [HttpGet("me/documents")]
        public async Task<IActionResult> GetMyDocuments()
        {
            try
            {
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

        // HÀM CẬP NHẬT GIẤY TỜ CỦA CHÍNH MÌNH VỚI RENTER ROLE
        [HttpPut("me/cccd")]
        [Authorize(Roles = "RENTER")]
        public async Task<IActionResult> UpsertMyCccd([FromBody] CccdUpsertDto dto)
        {
            try
            {
                var data = await _renterService.UpsertMyCccdAsync(dto);
                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Không tìm thấy thông tin Renter." });
            }
        }

        [HttpPut("me/driver-license")]
        [Authorize(Roles = "RENTER")]
        public async Task<IActionResult> UpsertMyDriverLicense([FromBody] DriverLicenseUpsertDto dto)
        {
            try
            {
                var data = await _renterService.UpsertMyDriverLicenseAsync(dto);
                return Ok(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Không tìm thấy thông tin Renter." });
            }
        }

        //  [ADMIN] Lấy danh sách Renter chờ duyệt
        [HttpGet("pending")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetPendingList()
        {
            var data = await _renterService.GetPendingVerificationsAsync();
            return Ok(data);
        }

        //  [ADMIN, STAFF] Lấy chi tiết 1 Renter
        // (Dùng khi Staff cần xác thực tại quầy hoặc Admin xem chi tiết)
        [HttpGet("{renterId}")]
        [Authorize(Roles = "ADMIN, STAFF")]
        public async Task<IActionResult> GetRenterDetails(int renterId)
        {
            try
            {
                var data = await _renterService.GetRenterForVerificationAsync(renterId);
                return Ok(data);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        //  [ADMIN, STAFF] Cập nhật trạng thái (Duyệt/Từ chối)
        [HttpPatch("{renterId}/verify")]
        [Authorize(Roles = "ADMIN, STAFF")] 
        public async Task<IActionResult> VerifyRenter(int renterId, [FromBody] bool isVerified)
        {
            // API này sẽ nhận 1 JSON body đơn giản là: true hoặc false
            try
            {
                await _renterService.SetRenterVerificationStatusAsync(renterId, isVerified);
                if (isVerified)
                {
                    return Ok(new { message = $"Đã DUYỆT thành công Renter (ID: {renterId})." });
                }
                else
                {
                    return Ok(new { message = $"Đã TỪ CHỐI (hoặc set về chờ) Renter (ID: {renterId})." });
                }
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

    }
}