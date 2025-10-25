namespace EVRentalAPI.Models
{
    public class User
    {
        public int user_id { get; set; }            // Khóa chính
        public string full_name { get; set; }       // Tên người dùng
        public string email { get; set; }           // Email
        public string password { get; set; }        // Mật khẩu
        public string role { get; set; }            // Renter, Staff, Admin
        public bool isVerified { get; set; }        // Trạng thái xác thực
    }
}
