using BusinessLogicLayer.DTOs.VehicleModels;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization; // Cần cho [Authorize]
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/vehicle-models")]
    public class VehicleModelsController : ControllerBase
    {
        private readonly IVehicleModelsService _vehicleModelsService;

        // Inject service
        public VehicleModelsController(IVehicleModelsService vehicleModelsService)
        {
            _vehicleModelsService = vehicleModelsService;
        }

        // GET /api/vehicle-models?search=...
        [HttpGet]
        [AllowAnonymous] // Cho phép Renter xem danh sách models
        public async Task<IActionResult> GetVehicleModels([FromQuery] VehicleModelListQuery query)
        {
            var result = await _vehicleModelsService.GetPagedAsync(query); // Phân trang
            return Ok(result.data);
        }

        // GET /api/vehicle-models/5
        [HttpGet("{id}")]
        [AllowAnonymous] // Cho phép Renter xem chi tiết
        public async Task<IActionResult> GetVehicleModelById(int id)
        {
            var model = await _vehicleModelsService.GetByIdAsync(id);
            if (model == null)
            {
                return NotFound(); // 404
            }
            return Ok(model); // 200
        }

        // POST /api/vehicle-models
        [HttpPost]
        [Authorize(Roles = "ADMIN,STAFF")] // Rule 1.4
        public async Task<IActionResult> CreateVehicleModel([FromBody] VehicleModelCreateDto dto)
        {
            try
            {
                var newModel = await _vehicleModelsService.CreateAsync(dto);
                // Trả về 201 Created và link đến resource mới
                return CreatedAtAction(nameof(GetVehicleModelById), new { id = newModel.VehicleModelId }, newModel);
            }
            catch (InvalidOperationException ex) // Bắt lỗi Unique
            {
                // Lỗi 400 Bad Request (do unique)
                return BadRequest(new { message = ex.Message }); 
            }
        }

        // PUT /api/vehicle-models/5
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN,STAFF")] // Rule 1.4
        public async Task<IActionResult> UpdateVehicleModel(int id, [FromBody] VehicleModelUpdateDto dto)
        {
            try
            {
                var success = await _vehicleModelsService.UpdateAsync(id, dto);
                if (!success)
                {
                    return NotFound(); // 404
                }
                return NoContent(); // 204
            }
            catch (InvalidOperationException ex) // Bắt lỗi Unique
            {
                return BadRequest(new { message = ex.Message }); 
            }
        }

        // DELETE /api/vehicle-models/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")] // Rule 1.4 (Chỉ ADMIN)
        public async Task<IActionResult> DeleteVehicleModel(int id)
        {
            var success = await _vehicleModelsService.DeleteAsync(id);
            
            if (success)
            {
                 return NoContent(); // 204
            }
            
            // Nếu false, check xem là 404 hay 409
            var modelExists = await _vehicleModelsService.GetByIdAsync(id); 
            if (modelExists == null)
            {
                return NotFound(); // 404
            }
            
            // Rule 1.5: Không xóa nếu có Vehicle đang dùng
            return Conflict(new { message = "Cannot delete model: It is currently associated with one or more vehicles." }); // 409
        }
    }
}