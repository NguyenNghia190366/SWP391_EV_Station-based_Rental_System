using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Renter
{
    public class RenterBriefDto
    {
        public int RenterId { get; set; } 
        public string FullName { get; set; } = string.Empty; // Lấy từ User
        public string Email { get; set; } = string.Empty; // Lấy từ User
        public string? PhoneNumber { get; set; } = string.Empty; // Lấy từ User (nullable)
    }
}