using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Station
{
    public class StationCreateDto
    {
        [Required, StringLength(255)]
        public string StationName { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public double? Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public double? Longitude { get; set; }

        [Required, RegularExpression("ACTIVE|INACTIVE", ErrorMessage = "Status must be 'ACTIVE' or 'INACTIVE'")]
        public string Status { get; set; } = "ACTIVE";

        [Range(0, int.MaxValue)]
        public int Capacity { get; set; } = 0;
    }
}