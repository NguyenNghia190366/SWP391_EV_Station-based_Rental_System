using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.User
{
    public class UserCreateDto
    {
        // SỬA ĐỔI 1: Đổi Username thành Email và thêm validation
        [Required(ErrorMessage = "Email is required.")]
        [StringLength(255)]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;

        // SỬA ĐỔI 2: Chuyển FullName thành bắt buộc
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;
        
        // THÊM MỚI 1: Thêm DateOfBirth bắt buộc
        [Required(ErrorMessage = "Date of birth is required.")]
        public DateOnly DateOfBirth { get; set; }

        // THÊM MỚI 2: Thêm PhoneNumber (không bắt buộc)
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        // SỬA ĐỔI 3: Dùng các giá trị từ database
        [Required]
        [RegularExpression("^(RENTER|STAFF|ADMIN)$", ErrorMessage = "Role must be 'RENTER', 'STAFF', or 'ADMIN'.")]
        public string Role { get; set; } = "RENTER";

        [Required]
        [RegularExpression("^(Active|Inactive|Blocked)$", ErrorMessage = "Status must be 'Active', 'Inactive', or 'Blocked'.")]
        public string Status { get; set; } = "Active";
    }
}