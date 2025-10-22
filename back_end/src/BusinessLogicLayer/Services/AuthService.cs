using System.IdentityModel.Tokens.Jwt;      // Types để tạo, quản lý và serialize/deserialize JWT (JwtSecurityToken, JwtSecurityTokenHandler)
using System.Security.Claims;               // Claim, ClaimTypes: dùng để gắn thông tin (sub, role, jti ...) vào JWT
using System.Text;                          // Encoding.UTF8: chuyển chuỗi secret sang byte[] khi tạo SymmetricSecurityKey

using BusinessLogicLayer.Interfaces;        // IAuthService interface: để implement service contract
using BusinessLogicLayer.DTOs.Auth;         // DTOs (RegisterRequestDto, LoginRequest, LoginResponse) dùng làm input/output cho service

using DataAccessLayer;                      // ApplicationDbContext để truy cập database
using DataAccessLayer.Models;               // Entity models (User, Renter, ...) mapping tới database tables
using Microsoft.EntityFrameworkCore;        // EF Core package
using Microsoft.Extensions.Configuration;   // IConfiguration: đọc cấu hình (appsettings.json / env vars) như Jwt:Key, Issuer...

using Microsoft.IdentityModel.Tokens;       // SymmetricSecurityKey, SigningCredentials, SecurityAlgorithms: hỗ trợ tạo chữ ký cho JWT
using BCrypt.Net;                           // BCrypt: thư viện hash mật khẩu an toàn

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

        public async Task<LoginResponse> RegisterAsync(RegisterRequestDto request)
        {
            // --- BƯỚC 1: KIỂM TRA & CHUẨN HÓA INPUT ---
            var cleanEmail = (request.Email ?? string.Empty).Trim().ToLower();
            if (string.IsNullOrEmpty(cleanEmail))
            {
                throw new ArgumentException("Email không được để trống.");
            }

            if (await _db.Users.AnyAsync(u => u.email.ToLower() == cleanEmail))
            {
                throw new ArgumentException("Email đã được sử dụng.");
            }

            // + hash mật khẩu (sử dụng BCrypt)
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
            
            // --- BƯỚC 2: TẠO ENTITY MỚI ---
            var newUser = new User
            {
                full_name = request.FullName,
                email = cleanEmail,
                password_hash = hashedPassword, // Lưu hash mật khẩu
                date_of_birth = DateOnly.FromDateTime(request.DateOfBirth),
                phone_number = request.PhoneNumber,
                // Gán vai trò mặc định một cách tường minh.
                // Dù DB có giá trị DEFAULT, việc gán ở đây giúp C# object có đầy đủ thông tin
                // ngay lập tức mà không cần đọc lại từ DB. 
                role = "RENTER"
            };

            var newRenter = new Renter { user = newUser };

            // --- BƯỚC 3: LƯU VÀO DATABASE ---
            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                await _db.Renters.AddAsync(newRenter);
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }

            // --- BƯỚC 4: TẠO TOKEN VÀ TRẢ VỀ ---
            return CreateLoginResponse(newUser);
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // --- BƯỚC 1: TÌM NGƯỜI DÙNG ---
            var cleanEmail = (request.Email ?? string.Empty).Trim().ToLower();
            if (string.IsNullOrEmpty(cleanEmail))
            {
                return null;
            }

            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.email.ToLower() == cleanEmail);

            if (user == null)
            {
                return null; // Không tìm thấy người dùng
            }

            // --- BƯỚC 2: XÁC THỰC ---
            // So sánh mật khẩu (sử dụng BCrypt)
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.password_hash))
            {
                return null; // Sai mật khẩu
            }

            // Kiểm tra trạng thái tài khoản [cite: 14]
            if (!"Active".Equals(user.status, StringComparison.OrdinalIgnoreCase))
            {
                return null; // Tài khoản không hoạt động
            }

            // --- BƯỚC 3: TẠO TOKEN VÀ TRẢ VỀ ---
            return CreateLoginResponse(user);
        }

        // --- PRIVATE HELPER METHODS ---

        /// <summary>
        /// Tạo đối tượng LoginResponse từ thông tin User.
        /// 2 HÀM LoginAsync VÀ RegisterAsync đều:  tạo token + return LoginResponse
        /// nên tạo "CreateLoginResponse" tách logic này ra thành hàm riêng để tái sử dụng.
        /// </summary>
        private LoginResponse CreateLoginResponse(User user)
        {
            var token = GenerateJwt(user.user_id, user.role);
            return new LoginResponse
            {
                Token = token,
                Role = user.role,
                UserId = user.user_id
            };
        }

        /// <summary>
        /// Tạo chuỗi JWT token.
        /// </summary>
        private string GenerateJwt(int userId, string role)
        {
            var jwtSettings = _cfg.GetSection("Jwt");
            var keyString = jwtSettings["Key"];

            if (string.IsNullOrEmpty(keyString))
            {
                throw new InvalidOperationException("JWT Key không được cấu hình trong appsettings.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                // Dù role đã được gán tường minh, việc kiểm tra null ở đây vẫn là một lớp phòng vệ tốt.
                new Claim(ClaimTypes.Role, role ?? "RENTER")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiresMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}