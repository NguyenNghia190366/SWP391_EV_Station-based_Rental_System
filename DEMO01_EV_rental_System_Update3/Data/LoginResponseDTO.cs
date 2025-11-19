namespace DEMO01_EV_rental_System.Data
{
    public class LoginResponseDTO
    {
        public int User_id { get; set; }

        public int Renter_Id { get; set; }

        public int Staff_id { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }

        public string? UserName { get; set; }
        public string? Token { get; set; }

        public int ExpirationInMinutes { get; set; }
    }
}
