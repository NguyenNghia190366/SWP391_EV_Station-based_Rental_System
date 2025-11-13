using BusinessLogicLayer.DTOs.Dashboard;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;
        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(DateTime? startDate, DateTime? endDate)
        {
            // ================================  TOTAL REVENUE  ================================
            #region
            // 1. Tính tổng doanh thu
            var revenueQuery = _context.Payments
                .Where(p => p.payment_status == "PAID" && // [cite: 32]
                            (p.fee_type == "PAY" || p.fee_type == "PAY_BONUS_FEE")); // [cite: 31]

            if (startDate.HasValue)
            {
                revenueQuery = revenueQuery.Where(p => p.created_at >= startDate.Value); // [cite: 32]
            }
            if (endDate.HasValue)
            {
                // Thêm 1 ngày để bao gồm cả ngày endDate (ví dụ: lọc đến hết ngày 15)
                revenueQuery = revenueQuery.Where(p => p.created_at < endDate.Value.AddDays(1)); // [cite: 32]
            }
            
            var totalRevenue = await revenueQuery.SumAsync(p => p.amount); // [cite: 31]
            #endregion
            // ================================  VEHICLE UTILIZATION  ================================
            #region 
            // 2. Tính tỷ lệ sử dụng xe
            var totalVehicles = await _context.Vehicles.CountAsync(); //

            var activeOrdersQuery = _context.RentalOrders
                .Where(o => o.status == "IN_USE" || o.status == "COMPLETED"); // [cite: 24, 25]

            // Lọc các đơn hàng BẮT ĐẦU trong khoảng thời gian
            if (startDate.HasValue)
            {
                activeOrdersQuery = activeOrdersQuery.Where(o => o.start_time >= startDate.Value); // [cite: 24]
            }
            if (endDate.HasValue)
            {
                activeOrdersQuery = activeOrdersQuery.Where(o => o.start_time < endDate.Value.AddDays(1)); // [cite: 24]
            }

            var activeOrdersCount = await activeOrdersQuery.CountAsync();

            double vehicleUtilizationRate = (totalVehicles > 0)
                ? (double)activeOrdersCount / totalVehicles
                : 0;
            #endregion
            // ================================  STATION ACTIVITY  ================================
            #region 
            // 3. Tính hoạt động của trạm (Lọc theo thời gian bắt đầu đơn hàng)
            var ordersInPeriodQuery = _context.RentalOrders.AsQueryable();

            if (startDate.HasValue)
            {
                ordersInPeriodQuery = ordersInPeriodQuery.Where(o => o.start_time >= startDate.Value); // [cite: 24]
            }
            if (endDate.HasValue)
            {
                ordersInPeriodQuery = ordersInPeriodQuery.Where(o => o.start_time < endDate.Value.AddDays(1)); // [cite: 24]
            }
            
            // Lấy dữ liệu đã lọc về memory trước khi group
            var ordersInPeriod = await ordersInPeriodQuery.ToListAsync();

            // Group theo Pickup
            var pickupGroups = ordersInPeriod
                .Where(o => o.pickup_station_id != null)
                .GroupBy(o => o.pickup_station_id) // [cite: 23]
                .ToDictionary(g => g.Key!.Value, g => g.Count());

            // Group theo Return (Lọc các đơn đã hoàn thành/trả xe trong kỳ)
            var returnGroups = ordersInPeriod
                .Where(o => o.return_station_id != null && (o.status == "COMPLETED" || o.status == "CANCELED")) // [cite: 23, 24, 25]
                .GroupBy(o => o.return_station_id) // [cite: 23]
                .ToDictionary(g => g.Key!.Value, g => g.Count());

            // Kết hợp với danh sách Station
            var stationActivity = await _context.Stations
                .Select(s => new StationActivityDto
                {
                    StationId = s.station_id, // [cite: 7]
                    StationName = s.station_name, // [cite: 7]
                    PickupCount = 0,
                    ReturnCount = 0
                }).ToListAsync();

            foreach (var station in stationActivity)
            {
                if (pickupGroups.ContainsKey(station.StationId))
                {
                    station.PickupCount = pickupGroups[station.StationId];
                }
                if (returnGroups.ContainsKey(station.StationId))
                {
                    station.ReturnCount = returnGroups[station.StationId];
                }
            }
            #endregion

            // 4. Tổng hợp kết quả
            var metrics = new DashboardMetricsDto
            {
                TotalRevenue = totalRevenue,
                TotalVehicles = totalVehicles,
                ActiveOrdersCount = activeOrdersCount,
                VehicleUtilizationRate = vehicleUtilizationRate,
                StationActivity = stationActivity.OrderByDescending(s => s.PickupCount + s.ReturnCount).ToList(),
                FilterStartDate = startDate,
                FilterEndDate = endDate
            };

            return metrics;
        }
    }
}