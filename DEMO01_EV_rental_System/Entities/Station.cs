using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Station
{
    public int StationId { get; set; }

    public string StationName { get; set; } = null!;

    public string Address { get; set; } = null!;

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string Status { get; set; } = null!;

    public int Capacity { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<RentalOrder> RentalOrderPickupStations { get; set; } = new List<RentalOrder>();

    public virtual ICollection<RentalOrder> RentalOrderReturnStations { get; set; } = new List<RentalOrder>();

    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
