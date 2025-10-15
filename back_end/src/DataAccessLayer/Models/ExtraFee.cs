using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("ExtraFee")]
[Index("FeeType_id", Name = "IX_ExtraFee_FeeType_id")]
[Index("order_id", Name = "IX_ExtraFee_order_id")]
public partial class ExtraFee
{
    [Key]
    public int fee_id { get; set; }

    public int order_id { get; set; }

    public int FeeType_id { get; set; }

    public string? description { get; set; }

    [Precision(3)]
    public DateTime created_at { get; set; }

    [ForeignKey("FeeType_id")]
    [InverseProperty("ExtraFees")]
    public virtual FeeType FeeType { get; set; } = null!;

    [ForeignKey("order_id")]
    [InverseProperty("ExtraFees")]
    public virtual RentalOrder order { get; set; } = null!;
}
