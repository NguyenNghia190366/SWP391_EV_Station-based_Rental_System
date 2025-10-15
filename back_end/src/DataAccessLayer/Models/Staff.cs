using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Index("user_id", Name = "UQ__Staff__B9BE370EF13222F0", IsUnique = true)]
public partial class Staff
{
    [Key]
    public int staff_id { get; set; }

    public int user_id { get; set; }

    public int? station_id { get; set; }

    [InverseProperty("staff")]
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    [ForeignKey("station_id")]
    [InverseProperty("Staff")]
    public virtual Station? station { get; set; }

    [ForeignKey("user_id")]
    [InverseProperty("Staff")]
    public virtual User user { get; set; } = null!;
}
