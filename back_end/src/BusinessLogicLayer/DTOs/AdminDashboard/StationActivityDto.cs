namespace BusinessLogicLayer.DTOs.Dashboard
{
    public class StationActivityDto
    {
        public int StationId { get; set; }
        public string StationName { get; set; } = string.Empty;
        public int PickupCount { get; set; } // Số lượt lấy xe
        public int ReturnCount { get; set; } // Số lượt trả xe
    }
}