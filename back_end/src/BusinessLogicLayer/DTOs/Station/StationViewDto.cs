namespace BusinessLogicLayer.DTOs.Station
{
    public class StationViewDto
    {
         public int StationId { get; set; }
        public string StationName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Status { get; set; } = "ACTIVE";
        public int Capacity { get; set; }
    }
}