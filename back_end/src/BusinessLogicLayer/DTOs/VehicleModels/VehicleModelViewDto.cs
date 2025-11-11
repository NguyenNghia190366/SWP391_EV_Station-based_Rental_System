namespace BusinessLogicLayer.DTOs.VehicleModels
{
    public class VehicleModelViewDto
    {
        public int VehicleModelId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public string? VehicleColor { get; set; } = string.Empty;
        public int NumberOfSeats { get; set; }
        public int? Mileage { get; set; }
        
        // --- THÊM 4 TRƯỜNG MỚI TỪ CSDL ---
        public string? TypeOfBattery { get; set; }
        public decimal? BatteryCapacity { get; set; }
        public decimal PricePerHour { get; set; }
        public decimal Deposit { get; set; }
        // ------------------------------------

        public int VehiclesCount { get; set; } // 
    }
}