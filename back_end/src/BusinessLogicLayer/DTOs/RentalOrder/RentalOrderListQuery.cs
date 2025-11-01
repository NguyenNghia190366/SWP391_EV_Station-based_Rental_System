namespace BusinessLogicLayer.DTOs.RentalOrder
{
    public class RentalOrderListQuery
    {
        public int? StationId { get; set; } // Staff lọc theo trạm
        public int? RenterId { get; set; } // Admin/Staff lọc theo Renter
        public string? Status { get; set; } // 'BOOKED', 'IN_USE', 'COMPLETED'...
        public DateTime? DateStart { get; set; }
        public DateTime? DateEnd { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Sort { get; set; }
    }
}