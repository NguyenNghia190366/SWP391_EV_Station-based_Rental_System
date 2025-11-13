using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Staff
{
    public class StaffAssignStationDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Station ID phải là một số nguyên dương.")]
        public int StationId { get; set; }
    }
}