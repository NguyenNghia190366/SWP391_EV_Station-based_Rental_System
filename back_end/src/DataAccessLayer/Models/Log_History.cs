using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Log_History")]
public partial class Log_History
{
    [Key]
    public int log_id { get; set; }

    public int? user_id { get; set; }

    [StringLength(50)]
    public string? log_type { get; set; }

    public string? action { get; set; }

    [Precision(3)]
    public DateTime log_date { get; set; }

    [ForeignKey("user_id")]
    [InverseProperty("Log_Histories")]
    public virtual User? user { get; set; }
}
