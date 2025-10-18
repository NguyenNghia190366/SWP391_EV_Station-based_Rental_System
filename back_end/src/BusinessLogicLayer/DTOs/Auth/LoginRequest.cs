using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class LoginRequest
    {
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty; // Nhận email

        [Required, StringLength(100)]
        public string Password { get; set; } = string.Empty; // Nhận password
        
    }
}