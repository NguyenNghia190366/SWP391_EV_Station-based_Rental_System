using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Vehicles
{
    public class VehicleListQuery
    {
        public string? Search { get; set; } // Search LicensePlate
        public int? StationId { get; set; } // Filter theo trạm
        public int? VehicleModelId { get; set; } // Filter theo model
        public bool? IsAvailable { get; set; } // Filter xe có sẵn
        
        [Range(0, 100)]
        public int? MinBattery { get; set; } // Filter pin tối thiểu

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Sort { get; set; }
    }
}