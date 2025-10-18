using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.User
{
    public class UserUpdateDto
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;

        // THÊM MỚI 1: Thêm PhoneNumber
        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        // THÊM MỚI 2: Thêm DateOfBirth
        [Required(ErrorMessage = "Date of birth is required.")]
        public DateOnly DateOfBirth { get; set; }

        // SỬA ĐỔI 1: Cập nhật validation cho Role
        [Required]
        [RegularExpression("^(RENTER|STAFF|ADMIN)$", ErrorMessage = "Role must be 'RENTER', 'STAFF', or 'ADMIN'.")]
        public string Role { get; set; } = string.Empty;

        // SỬA ĐỔI 2: Cập nhật validation cho Status
        [Required]
        [RegularExpression("^(Active|Inactive|Blocked)$", ErrorMessage = "Status must be 'Active', 'Inactive', or 'Blocked'.")]
        public string Status { get; set; } = string.Empty;
    }
}