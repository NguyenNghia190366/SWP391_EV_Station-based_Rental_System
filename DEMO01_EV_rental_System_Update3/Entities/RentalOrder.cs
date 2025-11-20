using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class RentalOrder
{
    public int OrderId { get; set; }

    public int RenterId { get; set; }

    public int VehicleId { get; set; }

    public int? PickupStationId { get; set; }

    public int? ReturnStationId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    //public decimal TotalAmount { get; set; }

    //public decimal DepositAmount { get; set; }

    

    public string Status { get; set; } = null!;

    public string? ImgVehicleBeforeUrl { get; set; }

    public string? ImgVehicleAfterUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    public virtual Contract? Contract { get; set; }

    public virtual ICollection<ExtraFee> ExtraFees { get; set; } = new List<ExtraFee>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Station? PickupStation { get; set; }

    public virtual Renter Renter { get; set; } = null!;

    public virtual Station? ReturnStation { get; set; }

    public virtual Vehicle Vehicle { get; set; } = null!;
}
