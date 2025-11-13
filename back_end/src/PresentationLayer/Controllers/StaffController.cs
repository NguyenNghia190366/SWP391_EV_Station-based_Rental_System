using BusinessLogicLayer.DTOs.Staff;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/staff")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        /// <summary>
        /// (Admin) Lấy danh sách tất cả nhân viên.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllStaff()
        {
            // Hàm này không cần try-catch vì nếu lỗi nó sẽ tự ném 500
            var staffList = await _staffService.GetAllStaffAsync();
            return Ok(staffList);
        }

        /// <summary>
        /// (Admin) Gán một nhân viên vào một trạm cụ thể.
        /// </summary>
        [HttpPut("{staffId}/assign-station")]
        public async Task<IActionResult> AssignStaffToStation(int staffId, [FromBody] StaffAssignStationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // 1. Gọi Service
                var updatedStaff = await _staffService.AssignStaffToStationAsync(staffId, dto);
                
                // 2. Thành công -> Trả về 200 OK
                return Ok(updatedStaff);
            }
            catch (KeyNotFoundException ex)
            {
                // 3. Bắt lỗi 404 (Không tìm thấy)
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // 4. Bắt các lỗi chung khác (500)
                return StatusCode(500, new { message = $"Lỗi máy chủ nội bộ: {ex.Message}" });
            }
        }
    }
}