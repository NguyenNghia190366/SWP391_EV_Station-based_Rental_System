using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Renter
{
    public int RenterId { get; set; }

    public int UserId { get; set; }

    public string? CurrentAddress { get; set; }

    public DateTime RegistrationDate { get; set; }

    public bool IsVerified { get; set; }

    public virtual Cccd? Cccd { get; set; }

    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    public virtual DriverLicense? DriverLicense { get; set; }

    public virtual ICollection<RentalOrder> RentalOrders { get; set; } = new List<RentalOrder>();

    public virtual User User { get; set; } = null!;
}
