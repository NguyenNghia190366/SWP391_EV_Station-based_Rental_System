using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.RentalOrder;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; // Để đọc User ID

namespace BusinessLogicLayer.Services
{
    public class RentalOrdersService : IRentalOrdersService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRenterService _renterService;

        // GIẢ ĐỊNH RULE 3: 200.000 / giờ
        private const decimal HOURLY_RATE = 200000;

        public RentalOrdersService(ApplicationDbContext context,
                                   IMapper mapper,
                                   IHttpContextAccessor httpContextAccessor,
                                   IRenterService renterService)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _renterService = renterService;
        }

        // Lấy User ID của người đang gọi API (từ Token)
        private int GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdClaim?.Value, out var id) ? id : 0;
        }

        // Hàm này nhận userId, dùng nội bộ
        private async Task<int> GetCurrentRenterId(int userId)
        {
            var renter = await _context.Renters.AsNoTracking()
                            .FirstOrDefaultAsync(r => r.user_id == userId);
            if (renter == null)
                throw new UnauthorizedAccessException("User is not a valid renter.");
            return renter.renter_id;
        }

        // Giữ lại hàm cũ (không tham số) để các hàm khác (như GetMyOrdersAsync)
        // vẫn hoạt động bình thường mà không bị lỗi
        private async Task<int> GetCurrentRenterId()
        {
            var userId = GetCurrentUserId();
            return await GetCurrentRenterId(userId); // Gọi hàm overload ở trên
        }

        

        // 1. CREATE (Rule 1, 2, 3)
        public async Task<RentalOrderViewDto> CreateOrderAsync(RentalOrderCreateDto dto)
        {
            // 1. Lấy User ID
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                throw new UnauthorizedAccessException("User token is invalid.");
            }

            // 2. *** THÊM GATE CHECK (YÊU CẦU PR-3) ***
            // Gọi service đã inject
            bool hasVerified = await _renterService.HasVerifiedDocumentsAsync(userId);
            if (!hasVerified)
            {
                // Từ chối nếu chưa đủ 2 giấy tờ
                throw new InvalidOperationException("Bạn phải xác thực đầy đủ CCCD và Giấy phép lái xe trước khi đặt xe.");
            }

            // 3. Lấy Renter ID (dùng lại userId đã lấy, không cần gọi GetCurrentUserId() nữa)
            var renterId = await GetCurrentRenterId(userId);

            // 4. Các logic cũ của cậu
            // Check thời gian
            if (dto.StartTime < DateTime.UtcNow || dto.EndTime <= dto.StartTime)
            {
                throw new InvalidOperationException("Invalid start or end time.");
            }

            // Rule 1: Check Tồn kho (xe có sẵn không)
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.vehicle_id == dto.VehicleId && v.is_available); 

            if (vehicle == null)
            {
                throw new InvalidOperationException("Vehicle is not available or does not exist.");
            }

            // Rule 2: Check Xung đột Lịch (Overlap)
            var existingOrders = await _context.RentalOrders.AnyAsync(o =>
                o.vehicle_id == dto.VehicleId && //
                (o.status == "BOOKED" || o.status == "IN_USE") && //
                (dto.StartTime < o.end_time && dto.EndTime > o.start_time) //
            );

            if (existingOrders)
            {
                throw new InvalidOperationException("Vehicle is already booked for the selected time slot.");
            }

            // Rule 3: Tính giá
            var durationHours = (dto.EndTime - dto.StartTime).TotalHours;
            var calculatedTotal = (decimal)durationHours * HOURLY_RATE;

            var order = _mapper.Map<RentalOrder>(dto);
            order.renter_id = renterId;
            order.total_amount = calculatedTotal; //
            order.status = "BOOKED"; // Trạng thái ban đầu
            order.payment_status = "UNPAID"; //

            _context.RentalOrders.Add(order);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(order.order_id))!;
        }

        // 2. GET BY ID (Chi tiết)
        public async Task<RentalOrderViewDto?> GetByIdAsync(int id)
        {
            return await _context.RentalOrders
                .Where(o => o.order_id == id)
                .ProjectTo<RentalOrderViewDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
        }

        // 3. GET PAGING (Cho Admin/Staff)
        public async Task<(IEnumerable<RentalOrderViewDto> data, int total)> GetPagedAsync(RentalOrderListQuery q)
        {
            var query = _context.RentalOrders.AsQueryable();

            // Filters
            if (q.StationId.HasValue) // Lọc theo trạm nhận
            {
                query = query.Where(o => o.pickup_station_id == q.StationId.Value);
            }
            if (q.RenterId.HasValue)
            {
                query = query.Where(o => o.renter_id == q.RenterId.Value);
            }
            if (!string.IsNullOrWhiteSpace(q.Status))
            {
                query = query.Where(o => o.status == q.Status);
            }
            // TODO: Filter ngày...

            var totalItems = await query.CountAsync();

            var data = await query
                .OrderByDescending(o => o.created_at)
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ProjectTo<RentalOrderViewDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return (data, totalItems);
        }

        // 4. GET MY ORDERS (Cho Renter)
        public async Task<(IEnumerable<RentalOrderViewDto> data, int total)> GetMyOrdersAsync(RentalOrderListQuery q)
        {
            var renterId = await GetCurrentRenterId();
            q.RenterId = renterId; // Tự động lọc theo renter đang đăng nhập
            return await GetPagedAsync(q);
        }

        // 5. UPDATE STATUS (Rule 4, 5)
        public async Task<bool> UpdateOrderStatusAsync(int id, RentalOrderActionDto dto)
        {
            // 1. Tải các thực thể liên quan
            // Cần Include(o.vehicle) và Include(o.renter)
            var order = await _context.RentalOrders
                .Include(o => o.vehicle) // Cần cho START_RENTAL và RETURN_VEHICLE
                .Include(o => o.renter) // Cần cho CANCEL_BY_RENTER
                .FirstOrDefaultAsync(o => o.order_id == id);

            if (order == null) return false;

            // 2. Lấy thông tin xác thực
            var userId = GetCurrentUserId();
            var userRole = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value ?? ""; // lấy role

            // Tải trước thông tin Staff nếu người dùng là Staff
            var staff = (userRole == "STAFF") ? await GetCurrentStaffAsync(userId) : null;

            // **Bổ sung: Dùng Transaction cho mọi hành động cập nhật**
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 4. Hàm switch giờ chỉ làm nhiệm vụ "Điều phối"
                switch (dto.Action)
                {
                    case RentalAction.CANCEL_BY_RENTER:
                        await HandleCancelByRenterAsync(order, userId, userRole);
                        break;

                    case RentalAction.APPROVE_BY_STAFF:
                    case RentalAction.REJECT_BY_STAFF:
                        await HandleApproveOrRejectAsync(order, staff, userRole, dto.Action);
                        break;

                    case RentalAction.START_RENTAL:
                        await HandleStartRentalAsync(order, staff, userRole, dto);
                        break;

                    case RentalAction.RETURN_VEHICLE:
                        await HandleReturnVehicleAsync(order, staff, userRole, dto);
                        break;

                    default:
                        throw new InvalidOperationException("Unknown action.");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); // Lưu tất cả thay đổi
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync(); // Hủy bỏ nếu có lỗi
                throw; // Ném lỗi ra để Controller bắt
            }
        }


        // ==========================================================
        // HÀM HELPER (PRIVATE) MỚI ĐƯỢC TÁCH RA
        // ==========================================================

        /// <summary>
        /// Lấy thông tin Staff (dùng cho việc check quyền theo Trạm)
        /// </summary>
        private async Task<Staff?> GetCurrentStaffAsync(int userId)
        {
            return await _context.Staff
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.user_id == userId);
        }

        /// <summary>
        /// Xử lý: Renter hủy đơn
        /// </summary>
        private Task HandleCancelByRenterAsync(RentalOrder order, int userId, string userRole)
        {
            // 1. Xác thực (Authorization)
            if (userRole != "RENTER" || (order.renter != null && order.renter.user_id != userId))
            {
                throw new UnauthorizedAccessException("Bạn không có quyền hủy đơn hàng này.");
            }
            
            // 2. Validation (Nghiệp vụ)
            if (order.status != "BOOKED")
            {
                throw new InvalidOperationException("Chỉ có thể hủy đơn hàng ở trạng thái 'BOOKED'.");
            }

            // 3. Cập nhật
            order.status = "CANCELED";
            // TODO: Xử lý hoàn cọc (nếu có)
            
            return Task.CompletedTask; // Thêm dòng này
        }

        /// <summary>
        /// Xử lý: Staff Duyệt/Từ chối đơn
        /// </summary>
        private Task HandleApproveOrRejectAsync(RentalOrder order, Staff? staff, string userRole, RentalAction action)
        {
            // 1. Xác thực (Authorization)
            if (userRole != "STAFF" && userRole != "ADMIN")
            {
                throw new UnauthorizedAccessException("Chỉ Staff hoặc Admin mới có quyền Duyệt/Từ chối.");
            }
            
            // 2. Xác thực (Quyền của Staff theo trạm)
            if (userRole == "STAFF")
            {
                if (staff == null)
                    throw new UnauthorizedAccessException("Không tìm thấy thông tin Staff.");
                if (staff.station_id != order.pickup_station_id)
                    throw new UnauthorizedAccessException("Staff không có quyền xử lý đơn hàng ở trạm này.");
            }

            // 3. Validation (Nghiệp vụ) - Dùng logic cũ của cậu
            if (order.status != "BOOKED")
            {
                throw new InvalidOperationException("Chỉ có thể Duyệt/Từ chối đơn hàng 'BOOKED'.");
            }

            // 4. Cập nhật
            order.status = (action == RentalAction.APPROVE_BY_STAFF) ? "APPROVED" : "REJECTED";
            
            return Task.CompletedTask; // Trả về Task đã hoàn thành
        }

        /// <summary>
        /// Xử lý: Staff Giao xe (Bắt đầu thuê)
        /// </summary>
        private Task HandleStartRentalAsync(RentalOrder order, Staff? staff, string userRole, RentalOrderActionDto dto)
        {
            // 1. Xác thực (Authorization)
            if (userRole != "STAFF" && userRole != "ADMIN")
            {
                throw new UnauthorizedAccessException("Chỉ Staff hoặc Admin mới có quyền Giao xe.");
            }

            // 2. Xác thực (Quyền của Staff theo trạm - Rule 5)
            if (userRole == "STAFF")
            {
                if (staff == null)
                    throw new UnauthorizedAccessException("Không tìm thấy thông tin Staff.");
                if (staff.station_id != order.pickup_station_id)
                    throw new UnauthorizedAccessException("Staff không có quyền giao xe ở trạm này.");
            }

            // 3. Validation (Nghiệp vụ)
            if (order.status != "APPROVED") //
            {
                throw new InvalidOperationException("Chỉ có thể giao xe cho đơn hàng 'APPROVED'.");
            }
            if (order.vehicle == null)
            {
                throw new InvalidOperationException("Đơn hàng chưa được gán xe.");
            }

            // 4. Validation (Input DTO)
            if (string.IsNullOrWhiteSpace(dto.ImgVehicleBeforeUrl))
            {
                throw new InvalidOperationException("Cần cung cấp 'ImgVehicleBeforeUrl' để bắt đầu thuê xe.");
            }
            // (Optional: Cậu có thể yêu cầu 'CurrentMileage' ở đây để check ODO lúc nhận)

            // 5. Cập nhật (Order và Vehicle)
            order.status = "IN_USE";
            order.img_vehicle_before_URL = dto.ImgVehicleBeforeUrl;
            order.vehicle.is_available = false; //

            return Task.CompletedTask; // Trả về Task đã hoàn thành
        }
        
        /// <summary>
        /// Xử lý: Staff Nhận xe (Trả xe) - (Hàm này đã được sửa lại)
        /// </summary>
        private Task HandleReturnVehicleAsync(RentalOrder order, Staff? staff, string userRole, RentalOrderActionDto dto)
        {
            // 1. Xác thực (Authorization)
            if (userRole != "STAFF" && userRole != "ADMIN")
            {
                throw new UnauthorizedAccessException("Chỉ Staff hoặc Admin mới có quyền Nhận xe.");
            }

            // 2. Xác thực (Quyền của Staff theo trạm)
            if (userRole == "STAFF")
            {
                if (staff == null)
                    throw new UnauthorizedAccessException("Không tìm thấy thông tin Staff.");
                // Check trạm trả xe
                if (staff.station_id != order.return_station_id)
                    throw new UnauthorizedAccessException("Staff không có quyền nhận xe ở trạm này.");
            }

            // 3. Validation (Nghiệp vụ) - Lấy từ code của cậu
            if (order.status != "IN_USE")
            {
                throw new InvalidOperationException("Đơn hàng không ở trạng thái 'IN_USE'.");
            }
            if (order.vehicle == null)
            {
                throw new InvalidOperationException("Đơn hàng không có xe đi kèm.");
            }

            // 4. Validation (Input DTO) - Lấy từ code của cậu
            if (string.IsNullOrWhiteSpace(dto.ImgVehicleAfterUrl) || 
                string.IsNullOrWhiteSpace(dto.VehicleConditionAfter) || 
                !dto.CurrentMileage.HasValue)
            {
                throw new InvalidOperationException("Cần cung cấp đầy đủ thông tin trả xe (Ảnh, Tình trạng, ODO).");
            }

            if (dto.CurrentMileage.Value < order.vehicle.current_mileage)
            {
                throw new InvalidOperationException("Số ODO (mileage) mới không thể thấp hơn số ODO hiện tại.");
            }

            // 5. Cập nhật (Order và Vehicle) - Lấy từ code của cậu
            order.status = "COMPLETED";
            order.payment_status = "PAID"; // (Giả định đã thanh toán xong)
            order.end_time = DateTime.UtcNow;
            order.img_vehicle_after_URL = dto.ImgVehicleAfterUrl;

            order.vehicle.is_available = true;
            order.vehicle.station_id = order.return_station_id; // Xe về trạm trả
            order.vehicle.condition = dto.VehicleConditionAfter;
            order.vehicle.current_mileage = dto.CurrentMileage.Value;

            return Task.CompletedTask; // Trả về Task đã hoàn thành
        }
    
    }
}