using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Cccd
{
    public int renter_Id { get; set; }

    public string? url_Cccd_Cmnd { get; set; }

    public string id_Card_Number { get; set; } = null!;

    public virtual Renter renter { get; set; } = null!;
}
