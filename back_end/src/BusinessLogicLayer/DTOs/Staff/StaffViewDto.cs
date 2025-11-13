namespace BusinessLogicLayer.DTOs.Staff
{
    public class StaffViewDto
    {
        public int StaffId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        
        // Thông tin trạm mà nhân viên được gán
        public int? StationId { get; set; }
        public string? StationName { get; set; }
    }
}