using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using DEMO01_EV_rental_System.Data.CurrentUserAccessor;

// ===================================================================
// DTOs (Copy vào file Controller hoặc tách file riêng)
// ===================================================================

// DTO Tạo đơn (Đã bỏ RenterId vì lấy từ Token)
public class RentalOrderCreateDto
{
    public int VehicleId { get; set; }
    public int? PickupStationId { get; set; }
    public int? ReturnStationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}

// DTO Trả xe (Để gửi ảnh bằng chứng)
public class RentalOrderReturnDto
{
    public string? VehicleConditionAfter { get; set; } // GOOD, SCRATCHED...
    public List<string> ImgVehicleAfterUrls { get; set; } = new List<string>();
}

// DTO Hiển thị (View)
public class RentalOrderViewDto
{
    public int OrderId { get; set; } 
    public string Status { get; set; } = string.Empty; // BOOKED, APPROVED, IN_USE, COMPLETED, CANCELED
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DepositAmount { get; set; }
    
    // Thông tin xe
    public string VehicleName { get; set; }  = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string VehicleImage { get; set; } = string.Empty;

    // Thông tin người thuê (Cho Admin xem)
    public string RenterName { get; set; } = string.Empty;
    public string RenterPhone { get; set; } = string.Empty;
}

// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RentalOrdersController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;
        private readonly ICurrentUserAccessor _currentUserAccessor; // <-- Inject

        public RentalOrdersController(RentalEvSystemFinalContext context, ICurrentUserAccessor currentUserAccessor)
        {
            _context = context;
            _currentUserAccessor = currentUserAccessor;
        }

        // ===================================================================
        // 1. GET ALL (Phân quyền Renter vs Admin)
        // ===================================================================
        // GET: api/RentalOrders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RentalOrderViewDto>>> GetRentalOrders()
        {
            var query = _context.RentalOrders
                .Include(o => o.Vehicle).ThenInclude(v => v.VehicleModel) // Lấy thông tin xe
                .Include(o => o.Renter).ThenInclude(r => r.User) // Lấy thông tin người thuê
                .AsNoTracking();

            // Logic phân quyền của Huy:
            // Nếu là Renter -> Chỉ lấy đơn của chính mình
            var role = _currentUserAccessor.Role;
            if (role == "RENTER")
            {
                var renterId = _currentUserAccessor.RenterId;
                query = query.Where(o => o.RenterId == renterId);
            }
            // Admin/Staff thì thấy hết

            var list = await query
                .OrderByDescending(o => o.CreatedAt) // Mới nhất lên đầu
                .Select(o => new RentalOrderViewDto
                {
                    OrderId = o.OrderId,
                    Status = o.Status,
                    StartTime = o.StartTime,
                    EndTime = o.EndTime,
                    // TotalAmount & Deposit (Nếu DB Nghĩa chưa có cột này thì tạm bỏ qua hoặc thêm vào DB)
                    // TotalAmount = o.TotalAmount, 
                    // DepositAmount = o.DepositAmount,
                    
                    VehicleName = o.Vehicle.VehicleModel.Model ?? string.Empty,
                    LicensePlate = o.Vehicle.LicensePlate ?? string.Empty,
                    VehicleImage = o.Vehicle.ImgCarUrl ?? string.Empty,

                    RenterName = o.Renter.User.FullName ?? string.Empty,
                    RenterPhone = o.Renter.User.PhoneNumber ?? string.Empty
                })
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/RentalOrders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RentalOrder>> GetRentalOrder(int id)
        {
            var order = await _context.RentalOrders
                .Include(o => o.Vehicle)
                .Include(o => o.Renter)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null) return NotFound();

            // Check quyền xem (Renter không được xem đơn người khác)
            var role = _currentUserAccessor.Role;
            if (role == "RENTER" && order.RenterId != _currentUserAccessor.RenterId)
            {
                return Forbid(); // 403 Forbidden
            }

            return order;
        }

        // ===================================================================
        // 2. CREATE ORDER (Logic tính tiền & Check trùng lịch)
        // ===================================================================
        // POST: api/RentalOrders
        [HttpPost]
        public async Task<ActionResult<RentalOrder>> PostRentalOrder(RentalOrderCreateDto dto)
        {
            // 1. Lấy Renter từ Token
            var renterId = _currentUserAccessor.RenterId;
            if (renterId == null) return BadRequest("Bạn chưa có hồ sơ Renter (chưa xác thực).");

            // 2. Check thời gian hợp lệ
            if (dto.StartTime < DateTime.UtcNow || (dto.EndTime.HasValue && dto.EndTime <= dto.StartTime))
            {
                return BadRequest("Thời gian thuê không hợp lệ.");
            }

            // 3. Check xe tồn tại & Sẵn sàng
            var vehicle = await _context.Vehicles
                .Include(v => v.VehicleModel)
                .FirstOrDefaultAsync(v => v.VehicleId == dto.VehicleId);
            
            if (vehicle == null) return BadRequest("Xe không tồn tại.");
            if (!vehicle.IsAvailable) return BadRequest("Xe đang không sẵn sàng (đang hỏng hoặc bảo trì).");

            // 4. Check trùng lịch (Overlap Check) - Logic cực quan trọng của Huy
            // "Xe đã có đơn nào BOOKED/APPROVED/IN_USE mà thời gian chồng lấn với đơn mới không?"
            var isOverlap = await _context.RentalOrders.AnyAsync(o =>
                o.VehicleId == dto.VehicleId &&
                (o.Status == "BOOKED" || o.Status == "APPROVED" || o.Status == "IN_USE") &&
                (dto.StartTime < o.EndTime && dto.EndTime > o.StartTime) 
            );

            if (isOverlap)
            {
                return BadRequest("Xe đã có người đặt trong khoảng thời gian này.");
            }

            // 5. Tính tiền (Optional - nếu DB Nghĩa hỗ trợ lưu tiền)
            // var hours = (dto.EndTime.Value - dto.StartTime).TotalHours;
            // var total = (decimal)hours * vehicle.VehicleModel.price_per_hour;

            // 6. Tạo đơn
            var order = new RentalOrder
            {
                RenterId = renterId.Value, // Lấy từ Token
                VehicleId = dto.VehicleId,
                PickupStationId = dto.PickupStationId,
                ReturnStationId = dto.ReturnStationId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = "BOOKED", // Mặc định là BOOKED
                CreatedAt = DateTime.UtcNow
                // TotalAmount = total
            };

            _context.RentalOrders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRentalOrder), new { id = order.OrderId }, order);
        }

        // ===================================================================
        // 3. CÁC HÀM ĐỔI TRẠNG THÁI (Giữ endpoint cũ của Nghĩa nhưng sửa ruột)
        // ===================================================================

        // APPROVE (Duyệt đơn) - Admin/Staff
        [HttpPut("Approve/{id}")] // Sửa route cho đúng chuẩn REST chút
        // [Authorize(Roles = "ADMIN, STAFF")]
        public async Task<IActionResult> ApproveOrder(int id)
        {
            var order = await _context.RentalOrders.FindAsync(id);
            if (order == null) return NotFound();

            if (order.Status != "BOOKED") 
                return BadRequest("Chỉ có thể duyệt đơn đang ở trạng thái BOOKED.");

            order.Status = "APPROVED";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // REJECT/CANCEL (Hủy đơn) - Renter/Admin/Staff
        [HttpPut("Reject/{id}")]
        public async Task<IActionResult> RejectOrder(int id)
        {
            var order = await _context.RentalOrders.FindAsync(id);
            if (order == null) return NotFound();

            // Logic quyền hủy
            var role = _currentUserAccessor.Role;
            if (role == "RENTER")
            {
                // Renter chỉ hủy đơn của mình và chưa lấy xe
                if (order.RenterId != _currentUserAccessor.RenterId) return Forbid();
                if (order.Status == "IN_USE" || order.Status == "COMPLETED") 
                    return BadRequest("Không thể hủy đơn đang đi hoặc đã hoàn thành.");
            }

            order.Status = "CANCELED";
            
            // Nếu hủy, nhả xe ra (đề phòng logic cũ set xe bận)
            // var vehicle = await _context.Vehicles.FindAsync(order.VehicleId);
            // vehicle.IsAvailable = true;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // IN_USE (Giao xe cho khách) - Staff
        [HttpPut("InUse/{id}")]
        // [Authorize(Roles = "ADMIN, STAFF")]
        public async Task<IActionResult> InUseOrder(int id)
        {
            var order = await _context.RentalOrders.FindAsync(id);
            if (order == null) return NotFound();

            if (order.Status != "APPROVED") 
                return BadRequest("Chỉ giao xe cho đơn đã được duyệt (APPROVED).");

            order.Status = "IN_USE";
            
            // Update Staff giao xe (Lấy từ Token)
            var staffId = _currentUserAccessor.StaffId;
            // order.PickupStaffId = staffId; (Nếu DB có cột này)

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // COMPLETE (Khách trả xe) - Staff
        [HttpPut("Complete/{id}")]
        // [Authorize(Roles = "ADMIN, STAFF")]
        public async Task<IActionResult> CompleteOrder(int id, [FromBody] RentalOrderReturnDto dto) 
        {
            // Chú ý: Thêm [FromBody] DTO để nhận ảnh/tình trạng xe nếu Frontend hỗ trợ gửi
            var order = await _context.RentalOrders
                .Include(o => o.Vehicle)
                .FirstOrDefaultAsync(o => o.OrderId == id);
                
            if (order == null) return NotFound();

            if (order.Status != "IN_USE") 
                return BadRequest("Đơn hàng chưa được giao xe (IN_USE), không thể trả.");

            // 1. Cập nhật đơn
            order.Status = "COMPLETED";
            order.EndTime = DateTime.UtcNow; // Ghi nhận giờ trả thực tế
            
            // 2. Cập nhật xe
            order.Vehicle.IsAvailable = true; // Xe sẵn sàng đón khách mới
            order.Vehicle.StationId = order.ReturnStationId; // Xe về trạm trả
            
            if (!string.IsNullOrEmpty(dto?.VehicleConditionAfter))
            {
                 order.Vehicle.Condition = dto.VehicleConditionAfter;
            }

            // 3. Lưu ảnh bằng chứng trả xe (Nếu DB hỗ trợ bảng ảnh riêng thì lưu vào đó)
            // if (dto?.ImgVehicleAfterUrls != null) { ... }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // (Giữ hàm DELETE và Exists cũ của Nghĩa cho Admin dùng nếu cần)
        // ...
    }
}