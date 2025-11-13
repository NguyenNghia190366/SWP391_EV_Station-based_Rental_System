using BusinessLogicLayer.DTOs.Complaint;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers // Nhớ đổi namespace của cậu
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComplaintsController : ControllerBase
    {
        private readonly IComplaintService _complaintService;

        public ComplaintsController(IComplaintService complaintService)
        {
            _complaintService = complaintService;
        }

        // 1. [POST] api/complaints
        // Chỉ RENTER mới được tạo
        [HttpPost]
        [Authorize(Roles = "RENTER")]
        public async Task<IActionResult> CreateComplaint([FromBody] ComplaintCreateDto createDto)
        {
            // Service đã dùng CurrentUserAccessor để lấy RenterId
            var complaintView = await _complaintService.CreateComplaintAsync(createDto);
            
            // Trả về 200 OK cùng DTO view (thay vì 201 CreatedAtAction cho đơn giản)
            return Ok(complaintView);
        }

        // 2. [GET] api/complaints/me
        // Chỉ RENTER xem khiếu nại của chính mình
        [HttpGet("me")]
        [Authorize(Roles = "RENTER")]
        public async Task<IActionResult> GetMyComplaints()
        {
            var complaints = await _complaintService.GetMyComplaintsAsync();
            return Ok(complaints);
        }

        // 3. [GET] api/complaints
        // Chỉ ADMIN hoặc STAFF xem tất cả (yêu cầu 3b )
        [HttpGet]
        [Authorize(Roles = "ADMIN, STAFF")]
        public async Task<IActionResult> GetAllComplaints([FromQuery] string? statusFilter = null)
        {
            var complaints = await _complaintService.GetComplaintsAsync(statusFilter);
            return Ok(complaints);
        }

        // 4. [PATCH] api/complaints/{complaintId}/resolve
        // Chỉ ADMIN hoặc STAFF được giải quyết (yêu cầu 3b )
        // Dùng PATCH vì đây là hành động cập nhật 1 phần (status)
        [HttpPatch("{complaintId}/resolve")]
        [Authorize(Roles = "ADMIN, STAFF")]
        public async Task<IActionResult> ResolveComplaint([FromRoute] int complaintId)
        {
            var result = await _complaintService.ResolveComplaintAsync(complaintId);
            
            // Nếu service không ném ngoại lệ (Exception) thì coi như thành công
            // Trả về 204 No Content là chuẩn RESTful cho update thành công
            return NoContent();
        }
    }
}