using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Station
{
    public class StationUpdateDto
    {
         [Required, StringLength(255)]
        public string StationName { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Range(-90, 90)]
        public double? Latitude { get; set; }

        [Range(-180, 180)]
        public double? Longitude { get; set; }

        [Required, RegularExpression("ACTIVE|INACTIVE")]
        public string Status { get; set; } = "ACTIVE";

        [Range(0, int.MaxValue)]
        public int Capacity { get; set; } = 0;
    }
}