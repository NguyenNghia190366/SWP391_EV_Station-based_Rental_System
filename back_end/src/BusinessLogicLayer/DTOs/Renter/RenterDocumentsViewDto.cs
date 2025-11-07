using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Renter
{
    public class RenterDocumentsViewDto
    {
        public string IdCardNumber { get; set; } = string.Empty;       // CCCD/CMND
        public string IdCardImageUrl { get; set; } = string.Empty;
        public string DriverLicenseNumber { get; set; } = string.Empty;    // GPLX
        public string DriverLicenseImageUrl { get; set; } = string.Empty;
        public bool IsVerified { get; set; }  // Trạng thái xác thực của Renter
    }
}