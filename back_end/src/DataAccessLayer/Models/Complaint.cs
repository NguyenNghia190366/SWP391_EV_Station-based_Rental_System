using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Complaint")]
[Index("order_id", Name = "IX_Complaint_order_id")]
public partial class Complaint
{
    [Key]
    public int complaint_id { get; set; }

    public int renter_id { get; set; }

    public int? order_id { get; set; }

    public string? description { get; set; }

    [Precision(3)]
    public DateTime created_date { get; set; }

    [Precision(3)]
    public DateTime? resolve_date { get; set; }

    [StringLength(50)]
    public string status { get; set; } = null!;

    [ForeignKey("order_id")]
    [InverseProperty("Complaints")]
    public virtual RentalOrder? order { get; set; }

    [ForeignKey("renter_id")]
    [InverseProperty("Complaints")]
    public virtual Renter renter { get; set; } = null!;
}
