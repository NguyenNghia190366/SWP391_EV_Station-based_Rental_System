using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("metrics")]
        public async Task<IActionResult> GetDashboardMetrics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var metrics = await _dashboardService.GetDashboardMetricsAsync(startDate, endDate);
            return Ok(metrics);
        }
    }
}