// PresentationLayer/Controllers/ReportsController.cs
using BusinessLogicLayer.DTOs.Report;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize(Roles = "STAFF, ADMIN")] // Yêu cầu Staff hoặc Admin
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// (Staff) Tạo một báo cáo sự cố mới
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "STAFF")] // Chỉ Staff mới được tạo
        public async Task<IActionResult> CreateReport([FromBody] ReportCreateDto dto)
        {
            try
            {
                var newReport = await _reportService.CreateReportAsync(dto);
                // Trả về 201 Created và link đến API GetById
                return CreatedAtAction(nameof(GetReportById), new { id = newReport.ReportId }, newReport);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message); // 403
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message }); // 404 (Không tìm thấy Order)
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi máy chủ nội bộ: " + ex.Message });
            }
        }

        /// <summary>
        /// (Admin/Staff) Lấy danh sách báo cáo (phân trang)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetReports([FromQuery] ReportListQuery query)
        {
            var (data, total) = await _reportService.GetReportsAsync(query);
            
            // (Nên thêm header phân trang ở đây)
            return Ok(new { data, total, query.Page, query.PageSize });
        }

        /// <summary>
        /// (Admin/Staff) Lấy chi tiết 1 báo cáo
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var report = await _reportService.GetReportByIdAsync(id);
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }
    }
}