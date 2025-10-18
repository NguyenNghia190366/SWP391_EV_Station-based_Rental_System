// BusinessLogicLayer/DTOs/User/UserViewDto.cs
namespace BusinessLogicLayer.DTOs.User
{
    public class UserViewDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty; // Đổi từ Username sang Email
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; } // Thêm PhoneNumber
        public string Role { get; set; } = "Renter";
        public string Status { get; set; } = "Active";
    }
}