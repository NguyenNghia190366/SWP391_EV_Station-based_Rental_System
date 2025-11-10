// BusinessLogicLayer/DTOs/Report/ReportCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Report
{
    public class ReportCreateDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [MinLength(10)]
        public string Detail { get; set; } = string.Empty;

        // Staff sẽ upload ảnh lên (vd: Cloudinary) trước,
        // rồi gửi một danh sách các URL ảnh về đây.
        public List<string> ImageUrls { get; set; } = new List<string>();
    }
}