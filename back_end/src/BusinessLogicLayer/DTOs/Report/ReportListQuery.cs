// BusinessLogicLayer/DTOs/Report/ReportListQuery.cs
namespace BusinessLogicLayer.DTOs.Report
{
    public class ReportListQuery
    {
        public int? StaffId { get; set; }
        public int? OrderId { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}