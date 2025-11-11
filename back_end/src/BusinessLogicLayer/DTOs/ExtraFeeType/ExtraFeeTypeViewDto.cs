namespace BusinessLogicLayer.DTOs.ExtraFeeType
{
    public class ExtraFeeTypeViewDto
    {
        public int ExtraFeeTypeId { get; set; }
        public string ExtraFeeTypeName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}