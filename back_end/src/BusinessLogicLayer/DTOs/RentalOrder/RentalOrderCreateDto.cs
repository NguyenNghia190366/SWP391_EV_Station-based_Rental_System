using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.RentalOrder
{
    public class RentalOrderCreateDto
    {
        [Required]
        public int VehicleId { get; set; } 

        [Required]
        public int PickupStationId { get; set; } 
        
        [Required]
        public int ReturnStationId { get; set; } // trạm trả xe

        [Required]
        public DateTime StartTime { get; set; } 

        [Required]
        public DateTime EndTime { get; set; } 
    }
}