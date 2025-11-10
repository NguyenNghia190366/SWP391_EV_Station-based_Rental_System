using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Renter
{
    public class RenterDocumentsViewDto
    {
        public string? IdCardNumber { get; set; }
        public string? DriverLicenseNumber { get; set; }
        
        // --- SỬA/THÊM 4 TRƯỜNG MỚI ---
        
        // URL ẢNH CCCD
        public string? UrlCccdCmndFront { get; set; }
        public string? UrlCccdCmndBack { get; set; }
        // URL ẢNH GPLX
        public string? UrlDriverLicenseFront { get; set; }
        public string? UrlDriverLicenseBack { get; set; }

        public bool IsVerified { get; set; }
    }
}