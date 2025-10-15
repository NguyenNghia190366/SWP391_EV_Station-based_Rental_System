using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Notification")]
public partial class Notification
{
    [Key]
    public int notification_id { get; set; }

    public int user_id { get; set; }

    public string message { get; set; } = null!;

    public bool is_read { get; set; }

    [Precision(3)]
    public DateTime created_at { get; set; }

    [ForeignKey("user_id")]
    [InverseProperty("Notifications")]
    public virtual User user { get; set; } = null!;
}
