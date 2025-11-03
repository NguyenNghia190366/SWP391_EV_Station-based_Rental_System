namespace BusinessLogicLayer.DTOs.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;   // "ADMIN" | "STAFF" | "RENTER"
        public int UserId { get; set; }

        public int? StaffId { get; set; }   // null nếu Role != "STAFF"
        public int? RenterId { get; set; }  // null nếu Role != "RENTER"
    }
}