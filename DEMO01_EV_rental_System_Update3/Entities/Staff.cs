using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Staff
{
    public int StaffId { get; set; }

    public int UserId { get; set; }

    public int? StationId { get; set; }

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    public virtual Station? Station { get; set; }

    public virtual User User { get; set; } = null!;
}
