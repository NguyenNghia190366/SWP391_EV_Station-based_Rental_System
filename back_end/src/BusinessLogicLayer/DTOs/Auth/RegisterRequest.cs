using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class RegisterRequestDto
    {
        // Yêu cầu: full_name NVARCHAR(255) NOT NULL 
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;

        // Yêu cầu: email NVARCHAR(255) NOT NULL UNIQUE 
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        // Yêu cầu: password_hash NVARCHAR(255) NOT NULL [cite: 8]
        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirm password is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
        
        // Yêu cầu: date_of_birth DATE NOT NULL [cite: 8]
        [Required(ErrorMessage = "Date of birth is required")]
        public DateTime DateOfBirth { get; set; }

        // Cho phép NULL: phone_number NVARCHAR(20) NULL 
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string? PhoneNumber { get; set; }
    }
}