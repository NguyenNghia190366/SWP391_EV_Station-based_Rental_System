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
    public DateTime created_at { get; set; }
    
    // 3. THÊM CÁC DÒNG MỚI NÀY:
    public string? fee_type { get; set; } // (PAY, PAY_BONUS_FEE, REFUND)
    public string payment_status { get; set; } = null!; // (UNPAID, PAID)
    public string? descrition { get; set; }

    [ForeignKey("order_id")]
    [InverseProperty("Payments")]
    public virtual RentalOrder order { get; set; } = null!;
}
