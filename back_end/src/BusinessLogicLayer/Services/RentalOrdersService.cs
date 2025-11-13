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
        private readonly INotificationService _notificationService;
        private readonly IPaymentsService _paymentsService;
        
        public RentalOrdersService(ApplicationDbContext context, 
                                   IMapper mapper,  
                                   ICurrentUserAccessor currentUser, 
                                   INotificationService notificationService, 
                                   IPaymentsService paymentsService)
        {
            _context = context;
            _mapper = mapper;
            _currentUser = currentUser;
            _notificationService = notificationService;
            _paymentsService = paymentsService;
        }

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
                o.vehicle_id == dto.VehicleId &&
                (o.status == "BOOKED" || o.status == "APPROVED" || o.status == "IN_USE") && // Thêm 'APPROVED'
                (dto.StartTime < o.end_time && dto.EndTime > o.start_time) 
            );

            if (existingOrders)
            {
                throw new InvalidOperationException("Vehicle is already booked for the selected time slot.");
            }

            // Rule 3: Tính giá (Lấy động từ Vehicle_Model)
            var durationHours = (dto.EndTime - dto.StartTime).TotalHours;

            // Lấy giá từ model của xe (đã include ở trên)
            var pricePerHour = vehicle.vehicle_model.price_per_hour; 
            var calculatedTotal = (decimal)durationHours * pricePerHour;

            var order = _mapper.Map<RentalOrder>(dto);
            order.renter_id = renterId.Value;

            // CSDL MỚI: Gán giá trị tính toán VÀ tiền cọc động
            order.total_amount = calculatedTotal; 
            order.deposit_amount = vehicle.vehicle_model.deposit; // <--- LẤY CỌC TỪ DB

            order.status = "BOOKED"; // Trạng thái ban đầu
            // order.payment_status = "UNPAID"; // (Trường này đã bị xóa khỏi RentalOrder)

            _context.RentalOrders.Add(order);
            await _context.SaveChangesAsync();
            
            // (Phải gọi GetByIdAsync để nạp DTO đầy đủ)
            var resultDto = await GetByIdAsync(order.order_id);
            return resultDto!;
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

            // CSDL MỚI: Phải Include các bảng ảnh mới (Img_Vehicle_Befores/Afters)
            // (AutoMapper ProjectTo sẽ KHÔNG tự động nạp các ICollection này)
            // (Chúng ta sẽ sửa lại logic này sau, khi sửa DTO)
            var order = await query
                .Include(o => o.renter).ThenInclude(r => r.user)
                .Include(o => o.vehicle).ThenInclude(v => v.vehicle_model)
                .Include(o => o.vehicle).ThenInclude(v => v.station)
                .Include(o => o.pickup_station)
                .Include(o => o.return_station)
                .Include(o => o.Payments) // Dùng Payments thay cho payment_status
                .Include(o => o.Img_Vehicle_Befores) // <-- CSDL MỚI
                .Include(o => o.Img_Vehicle_Afters)  // <-- CSDL MỚI
                .Include(o => o.pickup_staff)        // <-- CSDL MỚI
                .Include(o => o.return_staff)        // <-- CSDL MỚI
                .FirstOrDefaultAsync();

            if (order == null) return null;

            // Map thủ công (hoặc sửa AutoMapper Profile)
            var orderDto = _mapper.Map<RentalOrderViewDto>(order);
            
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
                // Dùng ProjectTo ở đây sẽ hiệu quả hơn GetByIdAsync
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
            // Phải Include cả Vehicle để cập nhật trạng thái
            var order = await _context.RentalOrders
                .Include(o => o.vehicle)
                .Include(o => o.renter) // <-- THÊM DÒNG NÀY
                .FirstOrDefaultAsync(o => o.order_id == id);
                
            if (order == null) return false;

            var userRole = _currentUser.Role;
            var renterId = _currentUser.RenterId;
            var staffId = _currentUser.StaffId;

            switch (dto.Action)
            {
                case RentalAction.CANCEL_BY_RENTER:
                    // Renter chỉ được hủy đơn 'BOOKED' của chính mình
                    if (userRole == "RENTER" && order.renter_id == renterId && 
                        (order.status == "BOOKED" || order.status == "APPROVED")) // Renter có thể hủy cả đơn đã duyệt
                    {
                        order.status = "CANCELED"; //
                        // TODO: Xử lý hoàn cọc (nếu có - Sẽ làm ở PaymentsService
                        await _paymentsService.CreateRefundRequestAsync(order.order_id);
                    }
                    else
                    {
                        throw new UnauthorizedAccessException("Cannot cancel this order."); 
                    }
                    break;

                // === LOGIC MỚI CHO CSDL MỚI ===
                case RentalAction.APPROVE_ORDER: // Staff/Admin duyệt đơn
                    if (userRole != "STAFF" && userRole != "ADMIN") 
                        throw new UnauthorizedAccessException("Only staff or admin can approve orders.");
                    
                    if (order.status != "BOOKED")
                        throw new InvalidOperationException("Only BOOKED orders can be approved.");

                    order.status = "APPROVED";
                    
                    await _context.SaveChangesAsync(); // <-- LƯU TRẠNG THÁI TRƯỚC

                    // === GỌI NOTIFICATION SERVICE (Giải quyết TODO) ===
                    if (order.renter != null)
                    {
                        await _notificationService.CreateNotificationAsync(
                            order.renter.user_id, // Lấy UserId từ Renter
                            $"Đơn hàng #{order.order_id} (Xe: {order.vehicle.license_plate}) đã được duyệt.",
                            "ORDER_APPROVED" // Loại thông báo
                        );
                    }

                    break; 
                // ==============================


                case RentalAction.START_RENTAL: // Staff giao xe
                    throw new NotSupportedException("Hành động START_RENTAL đã được thay thế bằng việc tạo hợp đồng (ContractsService).");

                case RentalAction.RETURN_VEHICLE: // Staff nhận xe
                    if (userRole != "STAFF" && userRole != "ADMIN") 
                        throw new UnauthorizedAccessException("Only staff or admin can return rentals.");

                    // TODO: Check Rule 5 (Staff station_id)
                    
                    if (order.status != "IN_USE")
                        throw new InvalidOperationException("Order is not IN_USE.");

                    // Rule 4: Cập nhật trạng thái
                    // === LOGIC CẬP NHẬT CHO CSDL MỚI ===
                    order.status = "COMPLETED";
                    order.end_time = DateTime.UtcNow;
                    order.return_staff_id = staffId; // Ghi nhận Staff nhận xe
                    // order.return_staff_cccd_number = ... (cần query thêm)
                    

                    // THÊM LOGIC MỚI (Lưu vào bảng 1-N):
                    // (Giả định DTO của cậu đã đổi thành List<string>)
                    if (dto.ImgVehicleAfterUrls != null && dto.ImgVehicleAfterUrls.Any())
                    {
                        foreach (var imageUrl in dto.ImgVehicleAfterUrls)
                        {
                            var imgAfter = new Img_Vehicle_After
                            {
                                order_id = order.order_id,
                                img_vehicle_after_URL = imageUrl
                            };
                            _context.Img_Vehicle_Afters.Add(imgAfter);
                        }
                    }

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