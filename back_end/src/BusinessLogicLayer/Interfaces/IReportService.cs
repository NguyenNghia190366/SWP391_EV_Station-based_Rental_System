// BusinessLogicLayer/Interfaces/IReportService.cs
using BusinessLogicLayer.DTOs.Report;

namespace BusinessLogicLayer.Interfaces
{
    public interface IReportService
    {
        /// <summary>
        /// (Staff) Tạo một báo cáo mới cho một đơn hàng
        /// </summary>
        Task<ReportViewDto> CreateReportAsync(ReportCreateDto dto);

        /// <summary>
        /// (Admin/Staff) Lấy danh sách báo cáo (phân trang)
        /// </summary>
        Task<(IEnumerable<ReportViewDto> data, int total)> GetReportsAsync(ReportListQuery query);

        /// <summary>
        /// (Admin/Staff) Lấy chi tiết 1 báo cáo
        /// </summary>
        Task<ReportViewDto?> GetReportByIdAsync(int reportId);
    }
}