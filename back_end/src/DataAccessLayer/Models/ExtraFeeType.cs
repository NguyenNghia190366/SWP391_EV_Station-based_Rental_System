using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccessLayer.Models;

[Table("ExtraFeeType")]
public partial class ExtraFeeType
{
    public int extra_fee_type_id { get; set; }

    public string extra_fee_type_name { get; set; } = null!;

    [Column(TypeName = "decimal(12, 2)")]
    public decimal amount { get; set; }
}