using BusinessLogicLayer.DTOs.RentalOrder;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/rental-orders")]
    [Authorize] // Module này yêu cầu đăng nhập
    public class RentalOrdersController : ControllerBase
    {
        private readonly IRentalOrdersService _rentalOrdersService;

        public RentalOrdersController(IRentalOrdersService rentalOrdersService)
        {
            _rentalOrdersService = rentalOrdersService;
        }

        // POST /api/rental-orders (Renter tạo đơn)
        [HttpPost]
        [Authorize(Roles = "RENTER")] //
        public async Task<IActionResult> CreateOrder([FromBody] RentalOrderCreateDto dto)
        {
            try
            {
                var newOrder = await _rentalOrdersService.CreateOrderAsync(dto);
                return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.OrderId }, newOrder);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // Lỗi 400 (Hết xe, Trùng lịch)
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message); // Lỗi 403
            }
        }

        // GET /api/rental-orders (Admin/Staff xem)
        [HttpGet]
        [Authorize(Roles = "ADMIN,STAFF")] //
        public async Task<IActionResult> GetRentalOrders([FromQuery] RentalOrderListQuery query)
        {
            var result = await _rentalOrdersService.GetPagedAsync(query);
            return Ok(result.data); // (Cần thêm header Paging)
        }

        // GET /api/rental-orders/my-orders (Renter xem đơn của mình)
        [HttpGet("my-orders")]
        [Authorize(Roles = "RENTER")] //
        public async Task<IActionResult> GetMyOrders([FromQuery] RentalOrderListQuery query)
        {
            var result = await _rentalOrdersService.GetMyOrdersAsync(query);
            return Ok(result.data); // (Cần thêm header Paging)
        }

        // GET /api/rental-orders/5 (Xem chi tiết)
        [HttpGet("{id}")]
        [Authorize(Roles = "RENTER,ADMIN,STAFF")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _rentalOrdersService.GetByIdAsync(id);
            if (order == null) return NotFound();
            
            // TODO: Cần check Renter chỉ được xem đơn của chính mình

            return Ok(order);
        }

        // PUT /api/rental-orders/5/action (Xử lý đơn)
        [HttpPut("{id}/action")]
        [Authorize(Roles = "RENTER,ADMIN,STAFF")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] RentalOrderActionDto dto)
        {
            try
            {
                var success = await _rentalOrdersService.UpdateOrderStatusAsync(id, dto);
                if (!success) return NotFound();
                return NoContent(); // 204
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // Lỗi 400 (VD: Đơn đã COMPLETED)
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message); // Lỗi 403 (VD: Renter hủy đơn đã APPROVED)
            }
        }
    }
}