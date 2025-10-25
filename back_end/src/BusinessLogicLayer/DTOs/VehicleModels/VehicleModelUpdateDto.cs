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
    }
}