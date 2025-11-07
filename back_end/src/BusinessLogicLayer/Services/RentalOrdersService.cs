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
        
        // GIẢ ĐỊNH RULE 3: 200.000 / giờ
        private const decimal HOURLY_RATE = 200000; 

        public RentalOrdersService(ApplicationDbContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        // Lấy User ID của người đang gọi API (từ Token)
        private int GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdClaim?.Value, out var id) ? id : 0;
        }

        // Lấy Renter ID (bảng Renter) từ User ID (bảng Users)
        private async Task<int> GetCurrentRenterId()
        {
            var userId = GetCurrentUserId();
            var renter = await _context.Renters.AsNoTracking()
                            .FirstOrDefaultAsync(r => r.user_id == userId);
            if (renter == null) 
                throw new UnauthorizedAccessException("User is not a valid renter.");
            return renter.renter_id;
        }

        // 1. CREATE (Rule 1, 2, 3)
        public async Task<RentalOrderViewDto> CreateOrderAsync(RentalOrderCreateDto dto)
        {
            var renterId = await GetCurrentRenterId();
            
            // Check thời gian
            if (dto.StartTime < DateTime.UtcNow || dto.EndTime <= dto.StartTime)
            {
                throw new InvalidOperationException("Invalid start or end time.");
            }
            
            // Rule 1: Check Tồn kho (xe có sẵn không)
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.vehicle_id == dto.VehicleId && v.is_available); //
            
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
                .Include(o => o.renter).ThenInclude(r => r.user) // Lấy User qua Renter
                .Include(o => o.vehicle).ThenInclude(v => v.vehicle_model) // Lấy Model qua Vehicle
                .Include(o => o.vehicle).ThenInclude(v => v.station) // Lấy Station qua Vehicle
                .Include(o => o.pickup_station) // Lấy trạm nhận
                .Include(o => o.return_station) // Lấy trạm trả
                .Include(o => o.Payments) // Lấy thanh toán
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
            var order = await _context.RentalOrders.Include(o => o.vehicle)
                .FirstOrDefaultAsync(o => o.order_id == id);
            if (order == null) return false;

            var userId = GetCurrentUserId();
            var userRole = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value ?? "";

            switch (dto.Action)
            {
                case RentalAction.CANCEL_BY_RENTER:
                    // Renter chỉ được hủy đơn 'BOOKED' của chính mình
                    if (userRole == "RENTER" && order.renter.user_id == userId && order.status == "BOOKED")
                    {
                        order.status = "CANCELED"; //
                        // TODO: Xử lý hoàn cọc (nếu có)
                    } else { throw new UnauthorizedAccessException("Cannot cancel this order."); }
                    break;

                case RentalAction.APPROVE_BY_STAFF:
                case RentalAction.REJECT_BY_STAFF:
                    // TODO: Rule 5 (Staff Authorization)
                    // Cần lấy Staff ID và Station ID của Staff
                    // var staff = await _context.Staff.FirstOrDefaultAsync(s => s.user_id == userId);
                    // if (staff == null || staff.station_id != order.pickup_station_id)
                    // {
                    //    throw new UnauthorizedAccessException("Staff not authorized for this station.");
                    // }
                    
                    if (userRole != "STAFF" && userRole != "ADMIN") 
                        throw new UnauthorizedAccessException("Only staff or admin can approve/reject.");
                    
                    if (order.status != "BOOKED")
                        throw new InvalidOperationException("Only BOOKED orders can be actioned.");

                    order.status = (dto.Action == RentalAction.APPROVE_BY_STAFF) ? "APPROVED" : "REJECTED";
                    // order.staff_id_processed = staff.staff_id; // <-- DB của cậu chưa có cột này
                    break;

                case RentalAction.START_RENTAL: // Staff giao xe
                    if (userRole != "STAFF" && userRole != "ADMIN") 
                        throw new UnauthorizedAccessException("Only staff or admin can start rentals.");
                    
                    // TODO: Check Rule 5 (Staff station_id)
                    
                    if (order.status != "APPROVED") // Chỉ đơn đã duyệt mới được lấy
                        throw new InvalidOperationException("Order must be APPROVED to start.");

                    // Rule 4: Cập nhật trạng thái
                    order.status = "IN_USE"; //
                    order.vehicle.is_available = false; //
                    // order.img_vehicle_before_URL = dto.ImgVehicleBeforeUrl; //
                    break;

                case RentalAction.RETURN_VEHICLE: // Staff nhận xe
                    if (userRole != "STAFF" && userRole != "ADMIN") 
                        throw new UnauthorizedAccessException("Only staff or admin can return rentals.");

                    // TODO: Check Rule 5 (Staff station_id)
                    
                    if (order.status != "IN_USE")
                        throw new InvalidOperationException("Order is not IN_USE.");

                    // Rule 4: Cập nhật trạng thái
                    order.status = "COMPLETED"; //
                    order.payment_status = "PAID"; // Giả định đã thanh toán xong
                    order.end_time = DateTime.UtcNow; // Ghi nhận thời gian trả thực tế
                    order.img_vehicle_after_URL = dto.ImgVehicleAfterUrl; //

                    // Cập nhật xe
                    order.vehicle.is_available = true; //
                    order.vehicle.station_id = order.return_station_id; //
                    order.vehicle.condition = dto.VehicleConditionAfter ?? "GOOD"; //
                    // TODO: Cập nhật mileage, battery
                    
                    break;
                    
                default:
                    throw new InvalidOperationException("Unknown action.");
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}