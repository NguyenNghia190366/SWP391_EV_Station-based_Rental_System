// BusinessLogicLayer/Services/ReportService.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.Report;
using BusinessLogicLayer.Helpers.CurrentUserAccessor; // (Giả định)
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserAccessor _currentUser; // Dùng để lấy StaffId
        private readonly INotificationService _notificationService;

        public ReportService(ApplicationDbContext context, IMapper mapper, ICurrentUserAccessor currentUser, INotificationService notificationService)
        {
            _context = context;
            _mapper = mapper;
            _currentUser = currentUser;
            _notificationService = notificationService;
        }

        public async Task<ReportViewDto> CreateReportAsync(ReportCreateDto dto)
        {
            // 1. Lấy StaffId từ token
            var staffId = _currentUser.StaffId;
            if (staffId == null)
            {
                throw new UnauthorizedAccessException("Bạn phải là nhân viên mới được tạo báo cáo.");
            }

            // === TÌM TÊN STAFF VÀ DANH SÁCH ADMIN (MỚI) ===
            // Lấy tên Staff (để đưa vào nội dung thông báo)
            var staffUser = await _context.Staff
                .AsNoTracking()
                .Include(s => s.user)
                .FirstOrDefaultAsync(s => s.staff_id == staffId.Value);
            var staffName = staffUser?.user?.full_name ?? "Một nhân viên";

            // Lấy danh sách User ID của tất cả Admin
            var adminUserIds = await _context.Users
                .AsNoTracking()
                .Where(u => u.role == "ADMIN")
                .Select(u => u.user_id)
                .ToListAsync();
            // ===============================================

            // 2. Kiểm tra Order có tồn tại không
            var orderExists = await _context.RentalOrders.AnyAsync(o => o.order_id == dto.OrderId);
            if (!orderExists)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng với ID: {dto.OrderId}");
            }

            // 3. Tạo Report (cha)
            var newReport = new Report
            {
                staff_id = staffId.Value,
                order_id = dto.OrderId,
                detail = dto.Detail
            };

            // 4. Thêm các ảnh (con)
            if (dto.ImageUrls.Any())
            {
                foreach (var url in dto.ImageUrls)
                {
                    newReport.Report_EV_Imgs.Add(new Report_EV_Img
                    {
                        img_url = url
                        // report_id sẽ được EF Core tự động gán khi Add
                    });
                }
            }

            // 5. Lưu vào DB
            _context.Reports.Add(newReport);
            await _context.SaveChangesAsync();

            // === GỌI NOTIFICATION SERVICE (MỚI) ===
            if (adminUserIds.Any())
            {
                string message = $"Nhân viên {staffName} vừa tạo báo cáo sự cố #{newReport.report_id} cho đơn hàng #{dto.OrderId}.";
                string type = "NEW_REPORT_FILED";

                foreach (var adminId in adminUserIds)
                {
                    await _notificationService.CreateNotificationAsync(adminId, message, type);
                }
            }

            // 6. Trả về DTO (phải gọi GetById để nạp StaffName)
            return (await GetReportByIdAsync(newReport.report_id))!;
        }

        public async Task<ReportViewDto?> GetReportByIdAsync(int reportId)
        {
            var report = await _context.Reports
                .AsNoTracking()
                .Where(r => r.report_id == reportId)
                // Dùng ProjectTo (cần AutoMapper) để nạp DTO
                .ProjectTo<ReportViewDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            return report;
        }

        public async Task<(IEnumerable<ReportViewDto> data, int total)> GetReportsAsync(ReportListQuery query)
        {
            var queryable = _context.Reports.AsNoTracking();

            // Lọc
            if (query.StaffId.HasValue)
            {
                queryable = queryable.Where(r => r.staff_id == query.StaffId.Value);
            }
            if (query.OrderId.HasValue)
            {
                queryable = queryable.Where(r => r.order_id == query.OrderId.Value);
            }

            // Đếm tổng
            var totalItems = await queryable.CountAsync();

            // Phân trang và map sang DTO
            var data = await queryable
                .OrderByDescending(r => r.report_id) // (Vì không có ngày tạo)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ProjectTo<ReportViewDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return (data, totalItems);
        }
    }
}