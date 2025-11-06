using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Contract
{
    public class ContractCreateDto
    {
        [Required]
        public int OrderId { get; set; } 
        
        // Thêm trường này theo nghiệp vụ "Nhận xe" 
        // Bảng RentalOrder cũng có cột "img_vehicle_before_URL" 
        [Required]
        [Url] // Đảm bảo đây là một URL hợp lệ
        public string ImgVehicleBeforeUrl { get; set; } = string.Empty;

        // public int StaffId { get; set; } // Tốt! Ta vẫn lấy từ Claims
    }
}