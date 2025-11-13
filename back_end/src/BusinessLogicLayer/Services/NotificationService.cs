using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.Helpers.CurrentUserAccessor;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserAccessor _currentUser; // Dùng để lấy UserId

        public NotificationService(ApplicationDbContext context, IMapper mapper, ICurrentUserAccessor currentUser)
        {
            _context = context;
            _mapper = mapper;
            _currentUser = currentUser;
        }

        // 1. HÀM TẠO THÔNG BÁO 
        public async Task CreateNotificationAsync(int userId, string message, string typeNotification)
        {
            // Kiểm tra xem User có tồn tại không
            var userExists = await _context.Users.AnyAsync(u => u.user_id == userId);
            if (!userExists)
            {
                // (Có thể log lỗi ở đây, nhưng không nên ném Exception 
                // vì sẽ làm hỏng nghiệp vụ chính, ví dụ: nghiệp vụ duyệt đơn)
                return; 
            }

            var notification = new Notification
            {
                user_id = userId,
                message = message,
                type_notification = typeNotification,
                is_read = false,
                created_at = DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification);
            // Lưu ngay lập tức
            await _context.SaveChangesAsync(); 
            
            // TODO: (Nâng cao) Bắn SignalR event về cho client ở đây
        }

        // 2. HÀM LẤY THÔNG BÁO CỦA TÔI
        public async Task<IEnumerable<NotificationViewDto>> GetMyNotificationsAsync(bool? onlyUnread)
        {
            var userId = _currentUser.UserId;
            if (userId == 0)
            {
                throw new UnauthorizedAccessException("Bạn cần đăng nhập.");
            }

            var query = _context.Notifications
                .AsNoTracking()
                .Where(n => n.user_id == userId);

            if (onlyUnread.HasValue && onlyUnread.Value == true)
            {
                query = query.Where(n => n.is_read == false);
            }

            return await query
                .OrderByDescending(n => n.created_at)
                .Take(50) // Giới hạn 50 thông báo gần nhất
                .ProjectTo<NotificationViewDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        // 3. HÀM ĐÁNH DẤU ĐÃ ĐỌC
        public async Task<bool> MarkNotificationAsReadAsync(int notificationId)
        {
            var userId = _currentUser.UserId;
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.notification_id == notificationId && n.user_id == userId);

            if (notification == null || notification.is_read)
            {
                // Không tìm thấy, hoặc đã đọc rồi
                return false;
            }

            notification.is_read = true;
            return await _context.SaveChangesAsync() > 0;
        }

        // 4. HÀM ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
        public async Task<bool> MarkAllMyNotificationsAsReadAsync()
        {
            var userId = _currentUser.UserId;
            
            var unreadNotifications = await _context.Notifications
                .Where(n => n.user_id == userId && n.is_read == false)
                .ToListAsync();

            if (!unreadNotifications.Any())
            {
                return false; // Không có gì để đánh dấu
            }

            foreach (var notification in unreadNotifications)
            {
                notification.is_read = true;
            }

            return await _context.SaveChangesAsync() > 0;
        }
    }
}