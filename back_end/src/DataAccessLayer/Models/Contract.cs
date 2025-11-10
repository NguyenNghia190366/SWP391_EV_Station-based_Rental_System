using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Contract")]
[Index("order_id", Name = "UQ__Contract__465962289047D7E8", IsUnique = true)]
public partial class Contract
{
    [Key]
    public int contract_id { get; set; }

    public int staff_id { get; set; }

    public int order_id { get; set; }

    [Precision(3)]
    public DateTime signed_date { get; set; }

    [StringLength(255)]
    public string? contract_pdf_url { get; set; }
    
    // THÊM 2 DÒNG MỚI NÀY:
    public string? contract_renter_signingimg_url { get; set; }
    public string? contract_owner_signingimg_url { get; set; }

    [ForeignKey("order_id")]
    [InverseProperty("Contract")]
    public virtual RentalOrder order { get; set; } = null!;

    [ForeignKey("staff_id")]
    [InverseProperty("Contracts")]
    public virtual Staff staff { get; set; } = null!;
}
