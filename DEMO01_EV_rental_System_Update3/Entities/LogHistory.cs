using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class LogHistory
{
    public int LogId { get; set; }

    public int? UserId { get; set; }

    public string? LogType { get; set; }

    public string? Action { get; set; }

    public DateTime LogDate { get; set; }

    public virtual User? User { get; set; }
}
