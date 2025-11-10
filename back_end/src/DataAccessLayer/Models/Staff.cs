using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Index("user_id", Name = "UQ__Staff__B9BE370EF13222F0", IsUnique = true)]
public partial class Staff
{
    public Staff()
    {
        Contracts = new HashSet<Contract>();

        // THÊM 2 DÒNG MỚI NÀY VÀO CONSTRUCTOR:
        RentalOrderpickup_staffs = new HashSet<RentalOrder>();
        RentalOrderreturn_staffs = new HashSet<RentalOrder>();
    }
    
    [Key]
    public int staff_id { get; set; }

    public int user_id { get; set; }

    public int? station_id { get; set; }

    [InverseProperty("staff")]
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    // THÊM 2 DÒNG MỚI NÀY (ở cuối file):
    public virtual ICollection<RentalOrder> RentalOrderpickup_staffs { get; set; }
    public virtual ICollection<RentalOrder> RentalOrderreturn_staffs { get; set; }

    [ForeignKey("station_id")]
    [InverseProperty("Staff")]
    public virtual Station? station { get; set; }

    [ForeignKey("user_id")]
    [InverseProperty("Staff")]
    public virtual User user { get; set; } = null!;
}
