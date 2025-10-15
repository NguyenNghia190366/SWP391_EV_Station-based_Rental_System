using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Payment")]
[Index("order_id", Name = "IX_Payment_order_id")]
public partial class Payment
{
    [Key]
    public int payment_id { get; set; }

    public int order_id { get; set; }

    [Column(TypeName = "decimal(12, 2)")]
    public decimal amount { get; set; }

    [StringLength(50)]
    public string payment_method { get; set; } = null!;

    [Precision(3)]
    public DateTime payment_date { get; set; }

    [StringLength(255)]
    public string? external_ref { get; set; }

    [ForeignKey("order_id")]
    [InverseProperty("Payments")]
    public virtual RentalOrder order { get; set; } = null!;
}
