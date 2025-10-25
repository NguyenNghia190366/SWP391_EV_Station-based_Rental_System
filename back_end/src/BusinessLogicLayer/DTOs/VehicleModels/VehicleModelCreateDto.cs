using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.VehicleModels
{
    public class VehicleModelCreateDto
    {
        [Required(ErrorMessage = "Brand name is required.")]
        [StringLength(100, MinimumLength = 2)]
        public string BrandName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Model name is required.")]
        [StringLength(100, MinimumLength = 1)]
        public string ModelName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? VehicleColor { get; set; }

        [Required(ErrorMessage = "Number of seats is required.")]
        [Range(1, 50, ErrorMessage = "Number of seats must be > 0.")] // Rule 1.5
        public int NumberOfSeats { get; set; }

        [Range(1, 1000, ErrorMessage = "Mileage (range) must be > 0.")] // Rule 1.5
        public int? Mileage { get; set; } // Giả định 'mileage' là 'RangeKm'
    }
}