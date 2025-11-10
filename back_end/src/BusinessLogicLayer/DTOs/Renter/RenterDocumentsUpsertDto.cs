using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Renter
{
    public class RenterDocumentsUpsertDto
    {
        // --- CCCD ---
        [Required]
        [StringLength(12, MinimumLength = 9)] 
        public string IdCardNumber { get; set; } = string.Empty;
        [Required]
        [Url]
        public string UrlCccdCmndFront { get; set; } = string.Empty;

        [Required]
        [Url]
        public string UrlCccdCmndBack { get; set; } = string.Empty;

        // --- GPLX ---
        [Required]
        [StringLength(12, MinimumLength = 12)] 
        public string DriverLicenseNumber { get; set; } = string.Empty;

        [Required]
        [Url]
        public string UrlDriverLicenseFront { get; set; } = string.Empty;

        [Required]
        [Url]
        public string UrlDriverLicenseBack { get; set; } = string.Empty;
    }
}