// PresentationLayer/Controllers/ExtraFeeTypesController.cs
using BusinessLogicLayer.DTOs.ExtraFeeType;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/extra-fee-types")]
    [Authorize(Roles = "ADMIN")] // CHỈ ADMIN MỚI ĐƯỢC QUẢN LÝ CÁC LOẠI PHÍ
    public class ExtraFeeTypesController : ControllerBase
    {
        private readonly IExtraFeeTypeService _feeTypeService;

        public ExtraFeeTypesController(IExtraFeeTypeService feeTypeService)
        {
            _feeTypeService = feeTypeService;
        }

        /// <summary>
        /// (Admin/Staff) Lấy danh sách TẤT CẢ các loại phí (để Staff dùng)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "ADMIN, STAFF")] // Cho phép cả Staff đọc để chọn
        public async Task<IActionResult> GetAllFeeTypes()
        {
            var feeTypes = await _feeTypeService.GetAllAsync();
            return Ok(feeTypes);
        }

        /// <summary>
        /// (Admin) Lấy chi tiết 1 loại phí
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFeeTypeById(int id)
        {
            var feeType = await _feeTypeService.GetByIdAsync(id);
            if (feeType == null)
            {
                return NotFound();
            }
            return Ok(feeType);
        }

        /// <summary>
        /// (Admin) Tạo loại phí mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateFeeType([FromBody] ExtraFeeTypeCreateDto dto)
        {
            try
            {
                var newFeeType = await _feeTypeService.CreateAsync(dto);
                // Trả về 201 Created
                return CreatedAtAction(nameof(GetFeeTypeById), new { id = newFeeType.ExtraFeeTypeId }, newFeeType);
            }
            catch (InvalidOperationException ex)
            {
                // Bắt lỗi 400 (Tên trùng)
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// (Admin) Cập nhật 1 loại phí
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeeType(int id, [FromBody] ExtraFeeTypeUpdateDto dto)
        {
            try
            {
                var success = await _feeTypeService.UpdateAsync(id, dto);
                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy loại phí để cập nhật." });
                }
                return NoContent(); // 204
            }
            catch (InvalidOperationException ex)
            {
                // Bắt lỗi 400 (Tên trùng)
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// (Admin) Xóa 1 loại phí
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeeType(int id)
        {
            var success = await _feeTypeService.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Không tìm thấy loại phí để xóa." });
            }
            return NoContent(); // 204
        }
    }
}