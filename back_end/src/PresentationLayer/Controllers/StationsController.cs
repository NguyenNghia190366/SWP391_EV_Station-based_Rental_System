using BusinessLogicLayer.DTOs.Station;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly IStationService _svc;
        public StationsController(IStationService svc) => _svc = svc;

        /// <summary>
        /// Lấy danh sách các trạm có phân trang và tìm kiếm.
        /// </summary>
        /// <param name="page">Số trang, mặc định là 1.</param>
        /// <param name="pageSize">Số mục trên mỗi trang, mặc định là 10.</param>
        /// <param name="search">Từ khóa tìm kiếm (tên trạm, địa chỉ...).</param>
        /// <returns>Danh sách các trạm cùng thông tin phân trang.</returns>
        [HttpGet]
        // [AllowAnonymous] cho phép bất kỳ ai cũng có thể gọi và truy cập endpoint này mà không cần đăng nhập.
        [AllowAnonymous]
        public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            // Một bước validation thủ công nhỏ để đảm bảo các tham số phân trang luôn hợp lệ.
            if (page <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "Số trang và kích thước trang phải lớn hơn 0." });
            }

            // Gọi service để lấy dữ liệu. Sử dụng tuple để nhận về cả data và tổng số record.
            var (data, total) = await _svc.GetPagedAsync(page, pageSize, search);

            // Trả về kết quả 200 OK, kèm theo dữ liệu và các thông tin phân trang cần thiết cho client.
            return Ok(new { data, total, page, pageSize });
        }

        /// <summary>
        /// Lấy thông tin chi tiết của một trạm theo ID.
        /// </summary>
        /// <param name="id">ID của trạm.</param>
        /// <returns>Thông tin chi tiết của trạm.</returns>
        [HttpGet("{id:int}")] // Ràng buộc tham số id phải là kiểu int.
        [AllowAnonymous]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var dto = await _svc.GetByIdAsync(id);

            // Sử dụng toán tử 3 ngôi: nếu không tìm thấy (dto is null) thì trả về 404 Not Found,
            // ngược lại trả về 200 OK cùng với dữ liệu.
            return dto is null ? NotFound() : Ok(dto);
        }

        /// <summary>
        /// Tạo một trạm mới (yêu cầu quyền Admin hoặc Staff).
        /// </summary>
        /// <param name="dto">Dữ liệu để tạo trạm mới.</param>
        /// <returns>Thông tin về trạm vừa được tạo.</returns>
        [HttpPost]
        // [Authorize] yêu cầu người dùng phải đăng nhập.
        // Roles = "..." chỉ định rõ những role nào được phép truy cập.
        [Authorize(Roles = "ADMIN,STAFF")]
        public async Task<IActionResult> Create([FromBody] StationCreateDto dto)
        {
            // [ApiController] đã tự động validate, dòng này có thể bỏ đi nhưng giữ lại cũng không sao.
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var id = await _svc.CreateAsync(dto);

            // CreatedAtAction là cách trả về chuẩn cho một request POST thành công.
            // Nó trả về status code 201 Created và một header 'Location'
            // chứa URL để lấy thông tin của resource vừa được tạo (chính là action GetById).
            return CreatedAtAction(nameof(GetById), new { id = id }, new { id = id });
        }

        /// <summary>
        /// Cập nhật thông tin một trạm (yêu cầu quyền Admin hoặc Staff).
        /// </summary>
        /// <param name="id">ID của trạm cần cập nhật.</param>
        /// <param name="dto">Dữ liệu mới cho trạm.</param>
        /// <returns>Không có nội dung nếu thành công.</returns>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN,STAFF")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] StationUpdateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            // Gọi service, service sẽ trả về true nếu cập nhật thành công, false nếu không tìm thấy trạm.
            var succeeded = await _svc.UpdateAsync(id, dto);

            // Nếu thành công, trả về 204 NoContent. Đây là response chuẩn cho PUT/DELETE thành công.
            // Nếu không tìm thấy trạm để cập nhật, trả về 404 Not Found.
            return succeeded ? NoContent() : NotFound();
        }

        /// <summary>
        /// Xóa một trạm (yêu cầu quyền Admin).
        /// </summary>
        /// <param name="id">ID của trạm cần xóa.</param>
        /// <returns>Không có nội dung nếu thành công.</returns>
        [HttpDelete("{id:int}")]
        // Giới hạn hành động nguy hiểm này chỉ cho ADMIN.
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var succeeded = await _svc.DeleteAsync(id);
            
            // Tương tự như Update, trả về 204 NoContent hoặc 404 Not Found.
            return succeeded ? NoContent() : NotFound();
        }
    }
}