using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Vehicles
{
    public class VehicleStatusUpdateDto
    {
        [Required]
        [StringLength(20)]
        public string Condition { get; set; } = string.Empty; // 'GOOD', 'IN_REPAIR', 'DAMAGED'

        [Required]
        public bool IsAvailable { get; set; } = true;

        [Range(0, 100)]
        public int? BatteryCapacity { get; set; } //

        [Range(0, int.MaxValue)]
        public int CurrentMileage { get; set; } //
    }
}