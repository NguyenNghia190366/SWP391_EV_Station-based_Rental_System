// BusinessLogicLayer/Services/AuthService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.Auth;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BusinessLogicLayer.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _cfg;

        public AuthService(ApplicationDbContext db, IConfiguration cfg)
        {
            _db = db;
            _cfg = cfg;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // --- BƯỚC 1: Tìm người dùng một cách an toàn ---

            // Chuẩn hóa email đầu vào: loại bỏ khoảng trắng thừa và chuyển sang chữ thường.
            // Sử dụng `?? string.Empty` để phòng trường hợp request.Email bị null.
            var cleanEmail = (request.Email ?? string.Empty).Trim().ToLower();

            // Tìm user trong DB.
            // - AsNoTracking(): Tối ưu hiệu suất cho các truy vấn chỉ đọc, không cần theo dõi thay đổi.
            // - ToLower(): Đảm bảo so sánh email không phân biệt chữ hoa/thường.
            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.email.ToLower() == cleanEmail);

            // ❌ Nếu không tìm thấy user với email này -> trả về null.
            if (user is null)
            {
                return null;
            }

            // --- BƯỚC 2: Xác thực thông tin ---

            // So sánh mật khẩu (hiện tại là plain text).
            // Dùng string.Equals cho an toàn và rõ ràng, Trim() để xử lý khoảng trắng thừa.
            if (!string.Equals(user.password_hash?.Trim(), request.Password?.Trim()))
            {
                return null; // Mật khẩu không khớp
            }

            // Kiểm tra trạng thái tài khoản.
            // Dùng StringComparison.OrdinalIgnoreCase để so sánh không phân biệt chữ hoa/thường.
            // DB của cậu có giá trị là 'Active'[cite: 8], nên chỉ cần kiểm tra với chuỗi này là đủ.
            if (!"Active".Equals(user.status, StringComparison.OrdinalIgnoreCase))
            {
                return null; // Tài khoản không hoạt động
            }

            // --- BƯỚC 3: Tạo Token và trả về kết quả ---

            // ✅ Nếu mọi thứ đều hợp lệ -> tạo JWT token
            var token = GenerateJwt(user.user_id, user.role);

            return new LoginResponse
            {
                Token  = token,
                Role   = user.role,
                UserId = user.user_id
            };
        }

        // Hàm tạo JWT, giữ nguyên logic chuẩn của cậu
        private string GenerateJwt(int userId, string role)
        {
            var jwt  = _cfg.GetSection("Jwt");
            var key  = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                // Thêm default role "RENTER" phòng trường hợp dữ liệu trong DB bị null
                new Claim(ClaimTypes.Role, role ?? "RENTER")
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiresMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}