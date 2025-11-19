using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class DriverLicense
{
    public int Renter_Id { get; set; }

    public string? url_Driver_License_front { get; set; }

    public string? url_Driver_License_back { get; set; }

    public string DriverLicenseNumber { get; set; } = null!;

    public virtual Renter Renter { get; set; } = null!;
}
