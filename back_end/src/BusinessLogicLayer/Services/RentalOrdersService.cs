using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.RentalOrder;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
// using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using BusinessLogicLayer.Helpers.CurrentUserAccessor;
// using System.Security.Claims; // Để đọc User ID

namespace BusinessLogicLayer.Services
{
    public class RentalOrdersService : IRentalOrdersService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserAccessor _currentUser;
        
        // // GIẢ ĐỊNH RULE 3: 200.000 / giờ
        // private const decimal HOURLY_RATE = 200000; 

        public RentalOrdersService(ApplicationDbContext context, IMapper mapper, ICurrentUserAccessor currentUser)
        {
            _context = context;
            _mapper = mapper;
            _currentUser = currentUser;
        }

        // // Lấy User ID của người đang gọi API (từ Token)
        // private int GetCurrentUserId()
        // {
        //     var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        //     return int.TryParse(userIdClaim?.Value, out var id) ? id : 0;
        // }

        // // Lấy Renter ID (bảng Renter) từ User ID (bảng Users)
        // private async Task<int> GetCurrentRenterId()
        // {
        //     var userId = GetCurrentUserId();
        //     var renter = await _context.Renters.AsNoTracking()
        //                     .FirstOrDefaultAsync(r => r.user_id == userId);
        //     if (renter == null) 
        //         throw new UnauthorizedAccessException("User is not a valid renter.");
        //     return renter.renter_id;
        // }

        // 1. CREATE (Rule 1, 2, 3)
        public async Task<RentalOrderViewDto> CreateOrderAsync(RentalOrderCreateDto dto)
        {
            var renterId = _currentUser.RenterId;
            if (renterId == null)
            {
                throw new UnauthorizedAccessException("User is not a valid renter.");
            }
            
            // Check thời gian
            if (dto.StartTime < DateTime.UtcNow || dto.EndTime <= dto.StartTime)
            {
                throw new InvalidOperationException("Invalid start or end time.");
            }
            
            // Rule 1: Check Tồn kho (xe có sẵn không)
            var vehicle = await _context.Vehicles
                                            .Include(v => v.vehicle_model)
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
            order.renter_id = renterId.Value;
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
            // Tạo câu query cơ sở
            var query = _context.RentalOrders
                .Where(o => o.order_id == id); // Lọc theo ID

            // --- KIỂM TRA QUYỀN TRƯỚC KHI LẤY DỮ LIỆU ---
            // Nếu user là RENTER, chúng ta bồi thêm 1 điều kiện Where
            if (_currentUser.Role == "RENTER")
            {
                // Renter chỉ được xem đơn có renter_id == RenterId của token
                query = query.Where(o => o.renter_id == _currentUser.RenterId);
            }
            // Nếu là ADMIN/STAFF thì không cần thêm Where (họ thấy hết)

            // Bây giờ, chạy câu query đã an toàn
            var orderDto = await query
                .Include(o => o.renter).ThenInclude(r => r.user)
                .Include(o => o.vehicle).ThenInclude(v => v.vehicle_model)
                .Include(o => o.vehicle).ThenInclude(v => v.station)
                .Include(o => o.pickup_station)
                .Include(o => o.return_station)
                .Include(o => o.Payments)
                .ProjectTo<RentalOrderViewDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            // Nếu query không thấy (vì không có hoặc vì xem trộm)
            // orderDto sẽ là null.
            return orderDto;
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
            // SỬA: Lấy RenterId từ helper (đơn giản hơn code cũ)
            var renterId = _currentUser.RenterId;
            if (renterId == null) 
                throw new UnauthorizedAccessException("User is not a valid renter.");
                
            q.RenterId = renterId.Value; // Tự động lọc
            return await GetPagedAsync(q);
        }
        
        // 5. UPDATE STATUS (Rule 4, 5)
        public async Task<bool> UpdateOrderStatusAsync(int id, RentalOrderActionDto dto)
        {
            var order = await _context.RentalOrders.Include(o => o.vehicle)
                .FirstOrDefaultAsync(o => o.order_id == id);
            if (order == null) return false;

            // SỬA: Lấy thông tin user từ helper (đơn giản hơn)
            var userRole = _currentUser.Role;
            var renterId = _currentUser.RenterId; // ID của người thuê (nếu có)
            var staffId = _currentUser.StaffId; // ID của nhân viên (nếu có)

            switch (dto.Action)
            {
                case RentalAction.CANCEL_BY_RENTER:
                    // Renter chỉ được hủy đơn 'BOOKED' của chính mình
                    if (userRole == "RENTER" && order.renter_id == renterId && order.status == "BOOKED")
                    {
                        order.status = "CANCELED"; //
                        // TODO: Xử lý hoàn cọc (nếu có)
                    }
                    else
                    {
                        throw new UnauthorizedAccessException("Cannot cancel this order."); 
                    }
                    break;


                case RentalAction.START_RENTAL: // Staff giao xe
                    throw new NotSupportedException("Hành động START_RENTAL đã được thay thế bằng việc tạo hợp đồng (ContractsService).");

                case RentalAction.RETURN_VEHICLE: // Staff nhận xe
                    if (userRole != "STAFF" && userRole != "ADMIN") 
                        throw new UnauthorizedAccessException("Only staff or admin can return rentals.");

                    // TODO: Check Rule 5 (Staff station_id)
                    
                    if (order.status != "IN_USE")
                        throw new InvalidOperationException("Order is not IN_USE.");

                    // Rule 4: Cập nhật trạng thái
                    order.status = "COMPLETED"; //
                    // order.payment_status = "PAID"; // Giả định đã thanh toán xong
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