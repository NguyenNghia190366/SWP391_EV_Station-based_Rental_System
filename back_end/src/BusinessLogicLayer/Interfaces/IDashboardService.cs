using BusinessLogicLayer.DTOs.Dashboard;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardMetricsDto> GetDashboardMetricsAsync(DateTime? startDate, DateTime? endDate);
    }
}