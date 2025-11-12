// Trong /DTOs/Renter/RenterVerificationViewDto.cs
namespace BusinessLogicLayer.DTOs.Renter
{
    public class RenterVerificationViewDto
    {
        // Thông tin từ User
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        
        // Thông tin từ Renter
        public int RenterId { get; set; }
        public bool IsVerified { get; set; }
        public DateTime RegistrationDate { get; set; }

        // Thông tin từ CCCD
        public string IdCardNumber { get; set; } = string.Empty;
        public string UrlCccdCmndFront { get; set; } = string.Empty;
        public string UrlCccdCmndBack { get; set; } = string.Empty;

        // Thông tin từ Driver_License
        public string DriverLicenseNumber { get; set; } = string.Empty;
        public string UrlDriverLicenseFront { get; set; } = string.Empty;
        public string UrlDriverLicenseBack { get; set; } = string.Empty;
    }
}