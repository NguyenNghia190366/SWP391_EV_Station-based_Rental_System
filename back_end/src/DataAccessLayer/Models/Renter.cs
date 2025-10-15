using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Renter")]
[Index("user_id", Name = "UQ__Renter__B9BE370E873C9385", IsUnique = true)]
public partial class Renter
{
    [Key]
    public int renter_id { get; set; }

    public int user_id { get; set; }

    [StringLength(255)]
    public string? current_address { get; set; }

    [Precision(3)]
    public DateTime registration_date { get; set; }

    public bool is_verified { get; set; }

    [InverseProperty("renter")]
    public virtual CCCD? CCCD { get; set; }

    [InverseProperty("renter")]
    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    [InverseProperty("renter")]
    public virtual Driver_License? Driver_License { get; set; }

    [InverseProperty("renter")]
    public virtual ICollection<RentalOrder> RentalOrders { get; set; } = new List<RentalOrder>();

    [ForeignKey("user_id")]
    [InverseProperty("Renter")]
    public virtual User user { get; set; } = null!;
}
