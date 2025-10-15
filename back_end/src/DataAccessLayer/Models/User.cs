using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Index("email", Name = "UQ__Users__AB6E6164450F326E", IsUnique = true)]
public partial class User
{
    [Key]
    public int user_id { get; set; }

    [StringLength(255)]
    public string full_name { get; set; } = null!;

    [StringLength(255)]
    public string email { get; set; } = null!;

    [StringLength(20)]
    public string? phone_number { get; set; }

    [StringLength(10)]
    public string role { get; set; } = null!;

    [StringLength(10)]
    public string status { get; set; } = null!;

    [StringLength(255)]
    public string password_hash { get; set; } = null!;

    public DateOnly date_of_birth { get; set; }

    [Precision(3)]
    public DateTime? last_login { get; set; }

    [Precision(3)]
    public DateTime created_at { get; set; }

    [InverseProperty("user")]
    public virtual ICollection<Log_History> Log_Histories { get; set; } = new List<Log_History>();

    [InverseProperty("user")]
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    [InverseProperty("user")]
    public virtual Renter? Renter { get; set; }

    [InverseProperty("user")]
    public virtual Staff? Staff { get; set; }
}
