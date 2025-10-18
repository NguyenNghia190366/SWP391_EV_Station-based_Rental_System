// BusinessLogicLayer/Services/AuthService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.Auth;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BusinessLogicLayer.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _cfg;

        // Constructor để inject DbContext và Configuration
        public AuthService(ApplicationDbContext db, IConfiguration cfg)
        {
            _db = db;
            _cfg = cfg; // IConfiguration dùng để đọc các setting từ file appsettings.json
        }

        // Logic xử lý đăng nhập cho người dùng
        // Trả về một LoginResponse chứa JWT token, Role và UserId nếu thành công, ngược lại trả về null.
        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // 🔎 Tìm user theo Email và Password (plain text tạm thời)
            var user = await _db.Users
                .FirstOrDefaultAsync(u =>
                    u.email == request.Email &&
                    u.password_hash == request.Password);

            // ❌ Nếu không tìm thấy user → trả null cho controller xử lý
            if (user is null)
            {
                return null;
            }

            // 🚫 Kiểm tra trạng thái tài khoản
            if (user.status != "ACTIVE")
            {
                // Không cho đăng nhập nếu bị khóa hoặc chưa kích hoạt
                return null;
            }

            // ✅ Nếu hợp lệ → tạo JWT token
            var token = GenerateJwt(user.user_id, user.role);

            // 🎯 Trả về kết quả cho client
            return new LoginResponse
            {
                Token = token,
                Role = user.role,   // Giữ nguyên role in uppercase (RENTER, STAFF, ADMIN)
                UserId = user.user_id
            };
        }
        
        //Tạo chuỗi JSON Web Token (JWT) cho người dùng đã được xác thực.
        private string GenerateJwt(int userId, string role) // userId và role sẽ được nhúng trong token
        {
            // Lấy các thông tin cấu hình JWT từ appsettings.json
            var jwt = _cfg.GetSection("Jwt"); 
            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));  
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            // Định nghĩa các "claims" - thông tin sẽ được mã hóa vào trong token
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()), // Subject: thường là ID của user
                new Claim(ClaimTypes.Role, role) // Claim chứa vai trò của user
            };
            // Tạo đối tượng token JWT
            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiresMinutes"]!)), // Thời gian hết hạn token
                signingCredentials: creds
            );
            // Chuyển đối tượng token thành dạng chuỗi và trả về
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
