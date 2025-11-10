using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Vehicles
{
    public class VehicleCreateDto
    {
        [Required]
        [StringLength(50)]
        public string LicensePlate { get; set; } = string.Empty;

        [Required]
        public int VehicleModelId { get; set; } //

        [Required]
        public int StationId { get; set; } //

        [Range(1970, 2100)]
        public int? ReleaseYear { get; set; } //

        [Range(0, int.MaxValue)]
        public int CurrentMileage { get; set; } = 0; //

        [StringLength(255)]
        public string? ImgCarUrl { get; set; } //
        
        [StringLength(20)]
        public string Condition { get; set; } = "GOOD"; //
    }
}