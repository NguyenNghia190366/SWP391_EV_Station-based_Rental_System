using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Contract
{
    public class ContractCreateDto
    {
        public int OrderId { get; set; } 
        // public int StaffId { get; set; } // lấy từ User.Claims (context người dùng hiện tại)
        /// <summary>
        /// Danh sách các URL ảnh xe trước khi bàn giao
        /// </summary>
        public List<string>? ImgVehicleBeforeUrls { get; set; }

        /// <summary>
        /// Số CCCD của nhân viên giao xe (nếu cần)
        /// </summary>
        [StringLength(50)] // Khớp với DB 
        public string? PickupStaffCccdNumber { get; set; }
    }
}