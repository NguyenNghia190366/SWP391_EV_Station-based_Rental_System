using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Staff
{
    public class StaffBriefDto
    {
        public int StaffId { get; set; } 
        public string FullName { get; set; } = string.Empty; // Lấy từ User
        public string Email { get; set; } = string.Empty; // Lấy từ User
    }
}