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

public class ContractCreateDto
{
    public int OrderId { get; set; }
    // public int StaffId { get; set; } // <-- BỎ, Lấy từ Token
    
    // Thông tin bổ sung khi giao xe (Logic của Huy)
    public string? PickupStaffCccdNumber { get; set; } // Số CCCD của Staff giao xe (nếu cần lưu)
    public List<string> ImgVehicleBeforeUrls { get; set; } = new List<string>(); // Ảnh xe TRƯỚC khi giao
}

public class ContractUpdateDto
{
    // Chỉ cho phép update link PDF sau khi ký xong
    public string? ContractPdfUrl { get; set; }
    public string? ContractRenterSigningimgUrl { get; set; }
    public string? ContractOwnerSigningimgUrl { get; set; }
}

public class ContractViewDto
{
    public int ContractId { get; set; }
    public int OrderId { get; set; }
    public DateTime SignedDate { get; set; }
    public string? ContractPdfUrl { get; set; }
    
    // Thông tin hiển thị thêm
    public string StaffName { get; set; } = string.Empty;
    public string RenterName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string VehicleName { get; set; } = string.Empty;
}

// ===================================================================

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContractsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;
        private readonly ICurrentUserAccessor _currentUserAccessor; // <-- Inject

        public ContractsController(RentalEvSystemFinalContext context, ICurrentUserAccessor currentUserAccessor)
        {
            _context = context;
            _currentUserAccessor = currentUserAccessor;
        }

        // ===================================================================
        // 1. GET ALL (Hiển thị đầy đủ thông tin)
        // ===================================================================
        // GET: api/Contracts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContractViewDto>>> GetContracts()
        {
            var query = _context.Contracts
                .Include(c => c.Staff).ThenInclude(s => s.User) // Lấy tên Staff
                .Include(c => c.Order).ThenInclude(o => o.Renter).ThenInclude(r => r.User) // Lấy tên Renter
                .Include(c => c.Order).ThenInclude(o => o.Vehicle).ThenInclude(v => v.VehicleModel) // Lấy thông tin xe
                .AsNoTracking();

            // Phân quyền xem (Renter chỉ xem của mình)
            if (_currentUserAccessor.Role == "RENTER")
            {
                var renterId = _currentUserAccessor.RenterId;
                query = query.Where(c => c.Order.RenterId == renterId);
            }

            var list = await query
                .OrderByDescending(c => c.SignedDate)
                .Select(c => new ContractViewDto
                {
                    ContractId = c.ContractId,
                    OrderId = c.OrderId,
                    SignedDate = c.SignedDate,
                    ContractPdfUrl = c.ContractPdfUrl,
                    
                    StaffName = c.Staff.User.FullName,
                    RenterName = c.Order.Renter.User.FullName,
                    LicensePlate = c.Order.Vehicle.LicensePlate,
                    VehicleName = c.Order.Vehicle.VehicleModel.Model ?? string.Empty
                })
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/Contracts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Contract>> GetContract(int id)
        {
            var contract = await _context.Contracts
                .Include(c => c.Staff).ThenInclude(s => s.User)
                .Include(c => c.Order)
                .FirstOrDefaultAsync(c => c.ContractId == id);

            if (contract == null) return NotFound();

            // Check quyền
            if (_currentUserAccessor.Role == "RENTER" && contract.Order.RenterId != _currentUserAccessor.RenterId)
            {
                return Forbid();
            }

            return contract;
        }

        // ===================================================================
        // 2. CREATE CONTRACT (Logic nghiệp vụ chính)
        // ===================================================================
        // POST: api/Contracts
        // [Authorize(Roles = "STAFF, ADMIN")] // Chỉ Staff mới được tạo HĐ
        [HttpPost]
        public async Task<ActionResult<Contract>> PostContract(ContractCreateDto dto)
        {
            // 1. Lấy Staff ID từ Token
            var staffId = _currentUserAccessor.StaffId;
            if (staffId == null) return BadRequest("Bạn không phải là nhân viên (Staff).");

            // 2. Validate Order
            var order = await _context.RentalOrders
                .Include(o => o.Vehicle)
                .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId);

            if (order == null) return NotFound("Đơn hàng không tồn tại.");

            // 3. Check trạng thái Order (Logic Huy)
            // Chỉ tạo HĐ khi đơn đã APPROVED
            if (order.Status != "APPROVED") 
            {
                return BadRequest($"Không thể tạo hợp đồng cho đơn hàng đang ở trạng thái {order.Status}. (Yêu cầu APPROVED)");
            }

            // 4. Check trùng Hợp đồng
            var exists = await _context.Contracts.AnyAsync(c => c.OrderId == dto.OrderId);
            if (exists) return BadRequest("Đơn hàng này đã có hợp đồng rồi.");

            // 5. Tạo Contract
            var contract = new Contract
            {
                OrderId = dto.OrderId,
                StaffId = staffId.Value,
                SignedDate = DateTime.UtcNow
                // ContractPdfUrl = ... (Sẽ update sau khi ký xong)
            };

            // 6. Cập nhật trạng thái Order -> IN_USE (Giao xe thành công)
            order.Status = "IN_USE";
            // order.PickupStaffId = staffId; (Nếu DB có cột này)
            
            // Lưu CCCD Staff giao xe (nếu DB có cột này)
            // order.PickupStaffCccdNumber = dto.PickupStaffCccdNumber; 

            // 7. Lưu ảnh xe TRƯỚC khi giao (Logic Huy) - Cần bảng ImgVehicleBefore (nếu có)
            // if (dto.ImgVehicleBeforeUrls.Any()) { ... lưu vào bảng Img_Vehicle_Before ... }

            // 8. Cập nhật Xe -> Bận
            order.Vehicle.IsAvailable = false; 

            _context.Contracts.Add(contract);
            
            try
            {
                await _context.SaveChangesAsync();
                
                // TODO: Gọi NotificationService báo cho Renter biết đã nhận xe
            }
            catch (DbUpdateException ex)
            {
                return BadRequest("Lỗi khi lưu hợp đồng: " + ex.Message);
            }

            return CreatedAtAction(nameof(GetContract), new { id = contract.ContractId }, contract);
        }

        // ===================================================================
        // 3. UPDATE CONTRACT (Chỉ update file PDF/Ảnh ký)
        // ===================================================================
        // PUT: api/Contracts/5
        // [Authorize(Roles = "STAFF, ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContract(int id, ContractUpdateDto dto)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null) return NotFound();

            // Chỉ cho phép cập nhật các trường liên quan đến file ký
            if (!string.IsNullOrEmpty(dto.ContractPdfUrl)) 
                contract.ContractPdfUrl = dto.ContractPdfUrl;
                
            // if (!string.IsNullOrEmpty(dto.ContractRenterSigningimgUrl)) 
            //     contract.ContractRenterSigningimgUrl = dto.ContractRenterSigningimgUrl;

            // if (!string.IsNullOrEmpty(dto.ContractOwnerSigningimgUrl)) 
            //     contract.ContractOwnerSigningimgUrl = dto.ContractOwnerSigningimgUrl;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Contracts/5
        // [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContract(int id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null) return NotFound();

            // Logic an toàn: Nếu xóa hợp đồng, có cần reset trạng thái Order về APPROVED không?
            // Tùy nghiệp vụ, ở đây tớ cứ xóa thẳng tay theo code cũ của Nghĩa.
            
            _context.Contracts.Remove(contract);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContractExists(int id)
        {
            return _context.Contracts.Any(e => e.ContractId == id);
        }
    }
}