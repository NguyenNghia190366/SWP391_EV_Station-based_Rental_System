using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    // [ApiController] là một attribute quan trọng giúp kích hoạt các tính năng dành riêng cho API
    // như: tự động validate model, binding source parameter, và trả về ProblemDetails cho lỗi.
    [ApiController]
    // [Route] định nghĩa URL cho controller này. "api/[controller]" sẽ tự động lấy tên "Auth".
    // => Endpoint sẽ là /api/Auth
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Sử dụng private readonly field để lưu trữ service được inject vào.
        private readonly IAuthService _authSvc;

        // Constructor Injection: inject IAuthService vào controller.
        // Đây là cách làm theo đúng nguyên tắc Dependency Injection (DI).
        public AuthController(IAuthService authSvc) => _authSvc = authSvc;

        /// <summary>
        /// Xử lý đăng nhập và trả về JWT nếu thành công.
        /// </summary>
        /// <param name="request">Thông tin đăng nhập bao gồm email và mật khẩu.</param>
        /// <returns>Đối tượng LoginResponse chứa JWT và thông tin người dùng.</returns>
        // [HttpPost("login")] định nghĩa đây là một action xử lý HTTP POST request
        // và endpoint của nó là /api/Auth/login
        [HttpPost("login")]
        // Các attribute [ProducesResponseType] giúp Swagger và các công cụ khác hiểu rõ
        // các loại HTTP response mà action này có thể trả về.
        // ---
        // Khi thành công (200 OK), trả về một đối tượng kiểu LoginResponse.
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        // Khi xác thực thất bại (401 Unauthorized).
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        // Khi dữ liệu gửi lên không hợp lệ (400 Bad Request), trả về ValidationProblemDetails.
        // [ApiController] sẽ tự động xử lý việc này.
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        // Sử dụng ActionResult<T> giúp định nghĩa rõ ràng kiểu dữ liệu trả về khi thành công (LoginResponse),
        // đồng thời vẫn cho phép trả về các kết quả HTTP khác như Unauthorized(), BadRequest()...
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            // Gọi đến service layer để xử lý logic đăng nhập một cách bất đồng bộ.
            var result = await _authSvc.LoginAsync(request);

            // Nếu service trả về null, nghĩa là thông tin đăng nhập không hợp lệ.
            if (result is null)
            {
                // Trả về HTTP status code 401 Unauthorized cùng một thông báo lỗi.
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            // Nếu đăng nhập thành công, trả về HTTP status code 200 OK cùng với dữ liệu (token, user info).
            return Ok(result);
        }
        // --- HÀM REGISTER (MỚI) ---
        /// <summary>
        /// Xử lý đăng ký tài khoản mới cho người thuê xe.
        /// </summary>
        /// <param name="request">Thông tin chi tiết để đăng ký tài khoản.</param>
        /// <returns>Đối tượng LoginResponse chứa JWT và thông tin người dùng nếu thành công.</returns>
        [HttpPost("register")]
        // Khi đăng ký thành công, trả về 200 OK cùng với token.
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        // Khi có lỗi nghiệp vụ (email đã tồn tại), trả về 400 Bad Request.
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                // Gọi đến service layer để thực hiện logic đăng ký.
                var result = await _authSvc.RegisterAsync(request);
                
                // Nếu không có lỗi, trả về 200 OK cùng với kết quả (token, user info).
                return Ok(result);
            }
            // Bắt lỗi cụ thể 'ArgumentException' được ném từ service khi email đã tồn tại.
            catch (ArgumentException ex)
            {
                // Trả về HTTP status 400 Bad Request cùng với thông báo lỗi từ service.
                // Điều này giúp client biết chính xác lý do đăng ký thất bại.
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}