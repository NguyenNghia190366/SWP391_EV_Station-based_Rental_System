using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Vehicles
{
    public class VehicleLocationUpdateDto
    {
        [Required]
        public int StationId { get; set; } //
    }
}