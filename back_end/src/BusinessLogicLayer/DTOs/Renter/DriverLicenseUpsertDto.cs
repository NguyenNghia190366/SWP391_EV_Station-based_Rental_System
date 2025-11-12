namespace BusinessLogicLayer.DTOs.Renter
{
    public class DriverLicenseUpsertDto
    {
        public string DriverLicenseNumber { get; set; } = string.Empty;
        public string UrlDriverLicenseFront { get; set; } = string.Empty;
        public string UrlDriverLicenseBack { get; set; } = string.Empty;
    }
}