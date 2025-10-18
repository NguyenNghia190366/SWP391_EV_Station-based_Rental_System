namespace BusinessLogicLayer.DTOs.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;   // "Admin" | "Staff" | "Renter"
        public int UserId { get; set; }
    }
}