using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Vehicle
{
    public class VehicleBriefDto
    {
        public int VehicleId { get; set; }
        public string LicensePlate { get; set; } = string.Empty; // Lấy từ Vehicle 
        public string BrandName { get; set; } = string.Empty; // Lấy từ Vehicle_Model 
        public string ModelName { get; set; } = string.Empty; // Lấy từ Vehicle_Model 
    }
}