public class NotificationViewDto
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string TypeNotification { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}