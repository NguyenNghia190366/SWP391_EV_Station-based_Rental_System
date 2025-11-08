using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class DriverLicense
{
    public int RenterId { get; set; }

    public string? UrlDriverLicense { get; set; }

    public string DriverLicenseNumber { get; set; } = null!;

    public virtual Renter Renter { get; set; } = null!;
}
