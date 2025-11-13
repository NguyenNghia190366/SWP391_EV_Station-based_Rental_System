namespace BusinessLogicLayer.DTOs.Dashboard
{
    public class DashboardMetricsDto
    {
        public decimal TotalRevenue { get; set; }
        public double VehicleUtilizationRate { get; set; } // Tỷ lệ (ví dụ: 0.8 -> 80%)
        public int TotalVehicles { get; set; }
        public int ActiveOrdersCount { get; set; } // Số đơn IN_USE hoặc COMPLETED
        public List<StationActivityDto> StationActivity { get; set; } = null!;

        // Thêm các thông tin về thời gian lọc
        public DateTime? FilterStartDate { get; set; }
        public DateTime? FilterEndDate { get; set; }
    }
}