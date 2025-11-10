namespace BusinessLogicLayer.DTOs.Vehicles
{
    // DTO lồng nhau cho Model
    public class VehicleModelNestedDto
    {
        public int VehicleModelId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public int NumberOfSeats { get; set; }
    }

    // DTO lồng nhau cho Station
    public class StationNestedDto
    {
        public int StationId { get; set; }
        public string StationName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    // DTO chính
    public class VehicleViewDto
    {
        public int VehicleId { get; set; }
        public string LicensePlate { get; set; } = string.Empty;
        public string? ImgCarUrl { get; set; }
        public bool IsAvailable { get; set; }
        public decimal? BatteryCapacity { get; set; }
        public string Condition { get; set; } = string.Empty;
        public int CurrentMileage { get; set; }
        public int? ReleaseYear { get; set; }

        // Dữ liệu lồng nhau
        public VehicleModelNestedDto? VehicleModel { get; set; }
        public StationNestedDto? Station { get; set; }
    }
}