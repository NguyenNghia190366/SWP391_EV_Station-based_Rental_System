using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    /// <summary>
    /// Controller xử lý các endpoint xác thực (login, register).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authSvc;

        public AuthController(IAuthService authSvc) => _authSvc = authSvc;

        /// <summary>
        /// Đăng nhập và trả về JWT nếu hợp lệ.
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var result = await _authSvc.LoginAsync(request);
            if (result is null) return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
            return Ok(result);
        }

        /// <summary>
        /// Đăng ký tài khoản mới (default role = Renter).
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                var result = await _authSvc.RegisterAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}