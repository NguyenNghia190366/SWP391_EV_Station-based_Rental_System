using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("FeeType")]
[Index("FeeType1", Name = "UQ__FeeType__A2FC90DB3D7F5957", IsUnique = true)]
public partial class FeeType
{
    [Key]
    public int FeeType_id { get; set; }

    [Column("FeeType")]
    [StringLength(100)]
    public string FeeType1 { get; set; } = null!;

    [Column(TypeName = "decimal(12, 2)")]
    public decimal amount { get; set; }

    [InverseProperty("FeeType")]
    public virtual ICollection<ExtraFee> ExtraFees { get; set; } = new List<ExtraFee>();
}
