using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("CCCD")]
[Index("id_card_number", Name = "UQ__CCCD__7B15C04801E9D24A", IsUnique = true)]
public partial class CCCD
{
    [Key]
    public int renter_id { get; set; }

    [StringLength(255)]
    public string? url_cccd_cmnd { get; set; }

    [StringLength(50)]
    public string id_card_number { get; set; } = null!;

    [ForeignKey("renter_id")]
    [InverseProperty("CCCD")]
    public virtual Renter renter { get; set; } = null!;
}
