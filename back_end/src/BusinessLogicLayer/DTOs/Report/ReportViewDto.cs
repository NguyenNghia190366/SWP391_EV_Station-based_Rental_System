// BusinessLogicLayer/DTOs/Report/ReportViewDto.cs
namespace BusinessLogicLayer.DTOs.Report
{
    public class ReportViewDto
    {
        public int ReportId { get; set; }
        public int OrderId { get; set; }
        public int StaffId { get; set; }
        
        // Chúng ta sẽ dùng AutoMapper để lấy tên Staff
        public string StaffName { get; set; } = string.Empty; 
        public string Detail { get; set; } = string.Empty;

        // (Lưu ý: Bảng Report của cậu [cite: 25] không có cột created_at,
        // nên tớ sẽ không thêm vào đây. Nếu muốn, chúng ta phải sửa CSDL)
        
        public List<string> ImageUrls { get; set; } = new List<string>();
    }
}