using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Cccd
{
    public int Renter_Id { get; set; }

    public string? url_Cccd_Cmnd_front { get; set; }

    public string? url_Cccd_Cmnd_back{ get; set; }

    public string id_Card_Number { get; set; } = null!;

    public virtual Renter renter { get; set; } = null!;
}
