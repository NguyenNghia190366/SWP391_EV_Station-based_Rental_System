namespace DataAccessLayer.Models;

public partial class ExtraFeeType
{
    public int extra_fee_type_id { get; set; }

    public string extra_fee_type_name { get; set; } = null!;

    public decimal amount { get; set; }
}