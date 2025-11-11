using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Complaint
{
    public int complaint_Id { get; set; }

    public int renter_Id { get; set; }

    public int? order_Id { get; set; }

    public string? description { get; set; }

    public DateTime created_Date { get; set; }

    public DateTime? resolve_Date { get; set; }

    public string status { get; set; } = null!;

    public virtual RentalOrder? order { get; set; }

    public virtual Renter renter { get; set; } = null!;
}
