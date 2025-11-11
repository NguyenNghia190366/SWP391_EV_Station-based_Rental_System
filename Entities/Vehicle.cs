using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Vehicle
{
    public int VehicleId { get; set; }

    public string Model { get; set; }

    public string LicensePlate { get; set; } = null!;

    public int VehicleModelId { get; set; }

    public int? ReleaseYear { get; set; }

    public int? BatteryCapacity { get; set; }

    public int CurrentMileage { get; set; }

    public string? ImgCarUrl { get; set; }

    public string Condition { get; set; } = null!;

    public bool IsAvailable { get; set; }

    public int? StationId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<RentalOrder> RentalOrders { get; set; } = new List<RentalOrder>();

    public virtual Station? Station { get; set; }

    public virtual VehicleModel VehicleModel { get; set; } = null!;
}
