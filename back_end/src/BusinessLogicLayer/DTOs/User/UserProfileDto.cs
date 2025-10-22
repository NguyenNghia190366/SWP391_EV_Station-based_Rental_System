// BusinessLogicLayer/DTOs/User/UserProfileDto.cs
namespace BusinessLogicLayer.DTOs.User
{
    /// DTO chứa thông tin profile chi tiết cho Renter (kết hợp từ User và Renter entities)
        public class UserProfileDto
    {
            // --- Thông tin từ bảng Users ---
            
            public int UserId { get; set; } 

            // NOT NULL trong DB, nên ta khởi tạo giá trị mặc định
            public string FullName { get; set; } = string.Empty; 

            // NOT NULL trong DB, nên ta khởi tạo giá trị mặc định
            public string Email { get; set; } = string.Empty; 

            // NULL trong DB, nên ta dùng ?
            public string? PhoneNumber { get; set; } 
            public DateOnly DateOfBirth { get; set; }
            
            // --- Thông tin từ bảng Renter  ---
            public string? CurrentAddress { get; set; }
            public bool IsVerified { get; set; }
            public DateTime RegistrationDate { get; set; }
    }
}