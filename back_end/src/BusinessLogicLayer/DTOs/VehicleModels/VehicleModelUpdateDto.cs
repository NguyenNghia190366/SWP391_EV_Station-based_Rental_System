using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.VehicleModels
{
    public class VehicleModelUpdateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string BrandName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string ModelName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? VehicleColor { get; set; }

        [Required]
        [Range(1, 50)]
        public int NumberOfSeats { get; set; }

        [Range(1, 1000)]
        public int? Mileage { get; set; }

        // --- THÊM 4 TRƯỜNG MỚI TỪ CSDL ---
        [StringLength(50)]
        public string? TypeOfBattery { get; set; }

        [Range(0, 200)]
        public decimal? BatteryCapacity { get; set; } // (kWh)

        [Required]
        [Range(0, (double)decimal.MaxValue)]
        public decimal PricePerHour { get; set; }

        [Required]
        [Range(0, (double)decimal.MaxValue)]
        public decimal Deposit { get; set; }
        // ------------------------------------
    }
}