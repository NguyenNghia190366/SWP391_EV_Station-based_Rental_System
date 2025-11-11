using System.Security.Claims;
using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _svc;
        public UsersController(IUserService svc) => _svc = svc;

        // Một property private tiện ích để lấy role của người dùng đang đăng nhập từ token (claims).
        // Giúp code ngắn gọn và dễ đọc hơn ở các action bên dưới.
        private string? CurrentRole => User.FindFirstValue(ClaimTypes.Role)?.ToUpperInvariant();

        /// <summary>
        /// Lấy danh sách người dùng. ADMIN xem tất cả, STAFF chỉ xem RENTER.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "ADMIN,STAFF")] // Chỉ ADMIN và STAFF được truy cập.
        public async Task<IActionResult> GetPaged(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? role = null,
            [FromQuery] string? status = null,
            [FromQuery] string? keyword = null)
        {
            if (page <= 0 || pageSize <= 0) return BadRequest(new { message = "Số trang và kích thước trang phải lớn hơn 0" });

            // **LOGIC PHÂN QUYỀN QUAN TRỌNG**
            // Nếu người dùng đang đăng nhập là STAFF, ta ghi đè tham số 'role' thành "RENTER".
            // Điều này đảm bảo STAFF chỉ có thể truy vấn danh sách RENTER, bất kể họ gửi gì lên query string.
            if (CurrentRole == "STAFF")
            {
                role = "RENTER";
            }

            var (data, total) = await _svc.GetPagedAsync(page, pageSize, role, status, keyword);
            return Ok(new { data, total, page, pageSize });
        }

        /// <summary>
        /// Lấy chi tiết một người dùng theo ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "ADMIN,STAFF")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var dto = await _svc.GetByIdAsync(id);

            // **LOGIC PHÂN QUYỀN QUAN TRỌNG**
            // Sau khi lấy được thông tin user, kiểm tra thêm một lớp bảo mật nữa:
            // Nếu người dùng hiện tại là STAFF và user họ muốn xem không phải là RENTER...
            if (dto != null && CurrentRole == "STAFF" && dto.Role?.ToUpperInvariant() != "RENTER")
            {
                // ...thì trả về 403 Forbidden. User có tồn tại nhưng bạn không có quyền xem.
                return Forbid();
            }
            
            return dto is null ? NotFound() : Ok(dto);
        }

        /// <summary>
        /// Tạo người dùng mới (chỉ ADMIN).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN")] // Chỉ ADMIN được tạo user.
        public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var id = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        /// <summary>
        /// Cập nhật thông tin người dùng (chỉ ADMIN).
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN")] // Chỉ ADMIN được cập nhật.
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UserUpdateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var succeeded = await _svc.UpdateAsync(id, dto);
            return succeeded ? NoContent() : NotFound();
        }

        /// <summary>
        /// Thay đổi trạng thái của người dùng (chỉ ADMIN).
        /// </summary>
        /// <param name="id">ID của người dùng.</param>
        /// <param name="status">Trạng thái mới (ví dụ: "Active", "Inactive").</param>
        [HttpPatch("{id:int}/status")] // PATCH là lựa chọn tốt để cập nhật một phần của resource.
        [Authorize(Roles = "ADMIN")] // Chỉ ADMIN được thay đổi trạng thái.
        public async Task<IActionResult> SetStatus([FromRoute] int id, [FromQuery] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(new { message = "Trạng thái không được để trống" });
            }

            var succeeded = await _svc.SetStatusAsync(id, status);
            return succeeded ? NoContent() : NotFound();
        }

        /// <summary>
        /// Lấy thông tin profile của người dùng đang đăng nhập.
        /// </summary>
        [HttpGet("profile")]
        [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserProfileDto>> GetMyProfile()
        {
            // (1) XÓA BỎ LOGIC LẤY UserId TỪ CLAIM

            // (2) GỌI HÀM SERVICE MỚI (không cần userId)
            var profile = await _svc.GetProfileAsync();

            if (profile == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin người dùng." });
            }

            return Ok(profile);
        }

        /// <summary>
        /// Cập nhật thông tin profile của người dùng đang đăng nhập.
        /// </summary>
        [HttpPut("profile")]
        [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserProfileDto>> UpdateMyProfile([FromBody] UserProfileUpdateDto dto)
        {
            // (1) XÓA BỎ LOGIC LẤY UserId TỪ CLAIM

            // (2) GỌI HÀM SERVICE MỚI (không cần userId)
            var updatedProfile = await _svc.UpdateProfileAsync(dto);

            if (updatedProfile == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng để cập nhật." });
            }

            return Ok(updatedProfile);
        }
        
        /// <summary>
        /// Thay đổi mật khẩu của người dùng đang đăng nhập.
        /// </summary>
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
        {
            // (1) XÓA BỎ LOGIC LẤY UserId TỪ CLAIM

            // (2) GỌI HÀM SERVICE MỚI (không cần userId)
            var (isSuccess, errorMessage) = await _svc.ChangePasswordAsync(dto);

            if (!isSuccess)
            {
                return BadRequest(new { message = errorMessage });
            }

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }
    }
}