using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.Complaint;
using BusinessLogicLayer.Helpers.CurrentUserAccessor; //
using BusinessLogicLayer.Interfaces;
using DataAccessLayer; //
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class ComplaintService : IComplaintService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserAccessor _currentUserAccessor;
        private readonly INotificationService _notificationService;

        public ComplaintService(ApplicationDbContext context, IMapper mapper, ICurrentUserAccessor currentUserAccessor, INotificationService notificationService)
        {
            _context = context;
            _mapper = mapper;
            _currentUserAccessor = currentUserAccessor;
            _notificationService = notificationService;
        }

        // 1. Renter tạo khiếu nại (Giữ nguyên)
        public async Task<ComplaintViewDto> CreateComplaintAsync(ComplaintCreateDto createDto)
        {
            var renterId = _currentUserAccessor.RenterId; //
            if (renterId == null)
            {
                throw new UnauthorizedAccessException("Bạn cần đăng nhập với vai trò Renter.");
            }

            var complaint = _mapper.Map<Complaint>(createDto); //

            complaint.renter_id = renterId.Value;
            complaint.status = "PROCESSING"; 
            complaint.created_date = DateTime.UtcNow; 

            if (createDto.OrderId.HasValue)
            {
                var orderOwned = await _context.RentalOrders //
                    .AnyAsync(o => o.order_id == createDto.OrderId && o.renter_id == renterId.Value);
                if (!orderOwned)
                {
                    throw new InvalidOperationException("Bạn không thể khiếu nại cho đơn hàng không thuộc về mình.");
                }
            }

            await _context.Complaints.AddAsync(complaint); //
            await _context.SaveChangesAsync();

            // Load navigation
            await _context.Entry(complaint)
                .Reference(c => c.renter)
                .Query()
                .Include(r => r.user)
                .LoadAsync();

            return _mapper.Map<ComplaintViewDto>(complaint);
        }

        // 2. Admin/Staff xem danh sách (ĐÃ SỬA DÙNG IEnumerable)
        public async Task<IEnumerable<ComplaintViewDto>> GetComplaintsAsync(string? statusFilter = null)
        {
            if (_currentUserAccessor.Role != "ADMIN" && _currentUserAccessor.Role != "STAFF") //
            {
                throw new UnauthorizedAccessException("Chỉ Admin hoặc Staff mới có quyền truy cập.");
            }

            var query = _context.Complaints //
                .Include(c => c.renter)
                .ThenInclude(r => r.user) 
                .OrderByDescending(c => c.created_date)
                .AsQueryable();

            if (!string.IsNullOrEmpty(statusFilter) && (statusFilter == "PROCESSING" || statusFilter == "RESOLVED"))
            {
                query = query.Where(c => c.status == statusFilter);
            }

            // Thay vì dùng PagedList, chúng ta dùng ToListAsync()
            return await query
                .ProjectTo<ComplaintViewDto>(_mapper.ConfigurationProvider) //
                .ToListAsync();
        }
        
        // 3. (Bonus) Renter xem khiếu nại (ĐÃ SỬA DÙNG IEnumerable)
        public async Task<IEnumerable<ComplaintViewDto>> GetMyComplaintsAsync()
        {
            var renterId = _currentUserAccessor.RenterId; //
            if (renterId == null)
            {
                throw new UnauthorizedAccessException("Bạn cần đăng nhập với vai trò Renter.");
            }

             var query = _context.Complaints //
                .Include(c => c.renter)
                .ThenInclude(r => r.user)
                .Where(c => c.renter_id == renterId.Value) 
                .OrderByDescending(c => c.created_date)
                .AsQueryable();

            // Thay vì dùng PagedList, chúng ta dùng ToListAsync()
            return await query
                .ProjectTo<ComplaintViewDto>(_mapper.ConfigurationProvider) //
                .ToListAsync();
        }

        // 4. Admin/Staff giải quyết khiếu nại (Giữ nguyên)
        public async Task<bool> ResolveComplaintAsync(int complaintId)
        {
            if (_currentUserAccessor.Role != "ADMIN" && _currentUserAccessor.Role != "STAFF") //
            {
                throw new UnauthorizedAccessException("Chỉ Admin hoặc Staff mới có quyền giải quyết.");
            }

            var complaint = await _context.Complaints
                .Include(c => c.renter) // <-- THÊM INCLUDE
                .FirstOrDefaultAsync(c => c.complaint_id == complaintId);

            if (complaint == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy khiếu nại (ID: {complaintId}).");
            }

            if (complaint.status == "RESOLVED")
            {
                throw new InvalidOperationException("Khiếu nại này đã được giải quyết trước đó.");
            }

            complaint.status = "RESOLVED";
            complaint.resolve_date = DateTime.UtcNow;

            _context.Complaints.Update(complaint);
            bool saved = await _context.SaveChangesAsync() > 0;
            
            // === GỌI NOTIFICATION SERVICE (Sau khi đã lưu thành công) ===
            if (saved && complaint.renter != null)
            {
                await _notificationService.CreateNotificationAsync(
                    complaint.renter.user_id, // Lấy user_id từ Renter
                    $"Khiếu nại #{complaintId} của bạn đã được giải quyết.",
                    "COMPLAINT_RESOLVED"
                );
            }
            // ==============================

            return saved;
        }
    }
}