using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Complaint
{
    public class ComplaintCreateDto
    {
        // order_id có thể null (khiếu nại chung) 
        public int? OrderId { get; set; }

        [Required(ErrorMessage = "Mô tả khiếu nại là bắt buộc.")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Mô tả phải từ 10 đến 1000 ký tự.")]
        public string Description { get; set; } = string.Empty;
    }
}