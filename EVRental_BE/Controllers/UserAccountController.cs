using Microsoft.AspNetCore.Mvc;

namespace EVRental_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAccountController : ControllerBase
    {
        /// <summary>
        /// MOCK Login endpoint - POST /api/UserAccount/login
        /// Returns hardcoded test accounts from DUMMY_ACCOUNTS.md
        /// </summary>
        [HttpPost("login")]
        public ActionResult<object> Login([FromBody] LoginRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email và password không được để trống" });
            }

            // MOCK: Hardcoded test accounts from DUMMY_ACCOUNTS.md
            var mockUsers = new[]
            {
                new {
                    userId = "admin001",
                    email = "admin@evrental.com",
                    password = "Admin@123",
                    userName = "Nguyễn Văn Admin",
                    fullName = "Nguyễn Văn Admin",
                    role = "ADMIN",
                    phone = "0900000001",
                    isVerified = true,
                    avatar = (string?)null,
                    createdAt = DateTime.UtcNow.AddDays(-30)
                },
                new {
                    userId = "staff001",
                    email = "staff@evrental.com",
                    password = "Staff@123",
                    userName = "Trần Thị Staff",
                    fullName = "Trần Thị Staff",
                    role = "STAFF",
                    phone = "0900000002",
                    isVerified = true,
                    avatar = (string?)null,
                    createdAt = DateTime.UtcNow.AddDays(-25)
                },
                new {
                    userId = "renter001",
                    email = "renter.verified@gmail.com",
                    password = "Renter@123",
                    userName = "Lê Văn Khách",
                    fullName = "Lê Văn Khách",
                    role = "RENTER",
                    phone = "0901234567",
                    isVerified = true,
                    avatar = (string?)null,
                    createdAt = DateTime.UtcNow.AddDays(-20)
                },
                new {
                    userId = "renter002",
                    email = "renter.nolicense@gmail.com",
                    password = "Renter@123",
                    userName = "Phạm Thị Mới",
                    fullName = "Phạm Thị Mới",
                    role = "RENTER",
                    phone = "0909876543",
                    isVerified = false,
                    avatar = (string?)null,
                    createdAt = DateTime.UtcNow.AddDays(-15)
                },
                new {
                    userId = "renter003",
                    email = "renter.nocccd@gmail.com",
                    password = "Renter@123",
                    userName = "Hoàng Văn Mới",
                    fullName = "Hoàng Văn Mới",
                    role = "RENTER",
                    phone = "0912345678",
                    isVerified = false,
                    avatar = (string?)null,
                    createdAt = DateTime.UtcNow.AddDays(-10)
                },
                new {
                    userId = "renter004",
                    email = "renter.new@gmail.com",
                    password = "Renter@123",
                    userName = "Đỗ Thị Hoàn Toàn Mới",
                    fullName = "Đỗ Thị Hoàn Toàn Mới",
                    role = "RENTER",
                    phone = "0923456789",
                    isVerified = false,
                    avatar = (string?)null,
                    createdAt = DateTime.UtcNow.AddDays(-5)
                }
            };

            // Find user by email
            var user = mockUsers.FirstOrDefault(u => 
                u.email.Equals(request.Email, StringComparison.OrdinalIgnoreCase));

            if (user == null)
            {
                return NotFound(new { message = "Email không tồn tại trong hệ thống" });
            }

            // Check password
            if (user.password != request.Password)
            {
                return Unauthorized(new { message = "Mật khẩu không chính xác" });
            }

            // Return user data without password
            var userResponse = new
            {
                userId = user.userId,
                email = user.email,
                userName = user.userName,
                fullName = user.fullName,
                role = user.role,
                phone = user.phone,
                isVerified = user.isVerified,
                avatar = user.avatar,
                createdAt = user.createdAt
            };

            return Ok(new
            {
                message = "Đăng nhập thành công",
                user = userResponse,
                token = GenerateSimpleToken(user.userId)
            });
        }

        /// <summary>
        /// Simple token generator (for development only)
        /// </summary>
        private string GenerateSimpleToken(string userId)
        {
            var timestamp = DateTime.UtcNow.Ticks;
            return $"TOKEN_{userId}_{timestamp}";
        }
    }

    /// <summary>
    /// Login request DTO
    /// </summary>
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
