
public interface INotificationService
{
    // 1. Hàm 'nội bộ' mà các service khác sẽ gọi
    Task CreateNotificationAsync(int userId, string message, string typeNotification);

    // 2. Hàm cho Renter/Staff gọi API để xem thông báo
    Task<IEnumerable<NotificationViewDto>> GetMyNotificationsAsync(bool? onlyUnread);
    
    // 3. Hàm để đánh dấu đã đọc
    Task<bool> MarkNotificationAsReadAsync(int notificationId);

    // 4. (Bonus) Đánh dấu tất cả đã đọc
    Task<bool> MarkAllMyNotificationsAsReadAsync();
}