namespace BusinessLogicLayer.DTOs.Complaint
{
    public class ComplaintViewDto
    {
        public int ComplaintId { get; set; }
        public int RenterId { get; set; }
        public string RenterName { get; set; } =string.Empty; // Sẽ lấy từ Renter -> User
        public int? OrderId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? ResolveDate { get; set; }
    }
}