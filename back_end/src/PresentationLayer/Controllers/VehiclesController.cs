using BusinessLogicLayer.DTOs.Vehicles;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        // GET /api/vehicles (Cho Renter, Staff, Admin)
        [HttpGet]
        [AllowAnonymous] // Cho phép Renter xem
        public async Task<IActionResult> GetVehicles([FromQuery] VehicleListQuery query)
        {
            var result = await _vehicleService.GetPagedAsync(query);
            // Cậu nên thêm Paging metadata vào Response Headers
            return Ok(result.data);
        }

        // GET /api/vehicles/5 (Cho Renter, Staff, Admin)
        [HttpGet("{id}")]
        [AllowAnonymous] // Cho phép Renter xem
        public async Task<IActionResult> GetVehicleById(int id)
        {
            var vehicle = await _vehicleService.GetByIdAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }
            return Ok(vehicle);
        }

        // POST /api/vehicles (Chỉ Admin)
        [HttpPost]
        [Authorize(Roles = "ADMIN")] //
        public async Task<IActionResult> CreateVehicle([FromBody] VehicleCreateDto dto)
        {
            try
            {
                var newVehicle = await _vehicleService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetVehicleById), new { id = newVehicle.VehicleId }, newVehicle);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // Lỗi 400 (FK, Unique)
            }
        }

        // PUT /api/vehicles/5/status (Admin và Staff)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "ADMIN,STAFF")] //
        public async Task<IActionResult> UpdateVehicleStatus(int id, [FromBody] VehicleStatusUpdateDto dto)
        {
            try
            {
                var success = await _vehicleService.UpdateStatusAsync(id, dto);
                if (!success)
                {
                    return NotFound();
                }
                return NoContent(); // 204
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/vehicles/5/location (Chỉ Admin)
        [HttpPut("{id}/location")]
        [Authorize(Roles = "ADMIN")] //
        public async Task<IActionResult> UpdateVehicleLocation(int id, [FromBody] VehicleLocationUpdateDto dto)
        {
            try
            {
                var success = await _vehicleService.UpdateLocationAsync(id, dto);
                if (!success)
                {
                    return NotFound();
                }
                return NoContent(); // 204
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // Lỗi 400 (FK Station)
            }
        }

        // DELETE /api/vehicles/5 (Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")] //
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var success = await _vehicleService.DeleteAsync(id);
            
            if (success)
            {
                return NoContent(); // 204
            }

            // Check xem vì sao false: 404 hay 409
            var vehicleExists = await _vehicleService.GetByIdAsync(id);
            if (vehicleExists == null)
            {
                return NotFound();
            }

            // Rule 4: Không xóa nếu có RentalOrder
            return Conflict(new { message = "Cannot delete vehicle: It is associated with existing rental orders." });
        }
    }
}