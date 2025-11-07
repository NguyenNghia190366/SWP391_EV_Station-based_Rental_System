using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Renter
{
    public class RenterDocumentsUpsertDto
    {
        public string IdCardNumber { get; set; } = string.Empty;
        public string IdCardImageUrl { get; set; } = string.Empty;
        public string DriverLicenseNumber { get; set; } = string.Empty;
        public string DriverLicenseImageUrl { get; set; } = string.Empty;
    }
}