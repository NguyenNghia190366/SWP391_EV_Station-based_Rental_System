using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Driver_License")]
[Index("driver_license_number", Name = "UQ__Driver_L__4A36048FF30BC28E", IsUnique = true)]
public partial class Driver_License
{
    [Key]
    public int renter_id { get; set; }

    [StringLength(255)]
    public string? url_driver_license { get; set; }

    [StringLength(50)]
    public string driver_license_number { get; set; } = null!;

    [ForeignKey("renter_id")]
    [InverseProperty("Driver_License")]
    public virtual Renter renter { get; set; } = null!;
}
