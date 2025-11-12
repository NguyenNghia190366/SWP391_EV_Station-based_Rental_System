namespace BusinessLogicLayer.DTOs.Renter
{
    public class CccdUpsertDto
    {
        public string IdCardNumber { get; set; } = string.Empty;
        public string UrlCccdCmndFront { get; set; } = string.Empty;
        public string UrlCccdCmndBack { get; set; } = string.Empty;
    }
}