using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class VehicleModel
{
    public int VehicleModelId { get; set; }

    public string BrandName { get; set; } = null!;

    public string? VehicleColor { get; set; }

    public int NumberOfSeats { get; set; }

    public int? Mileage { get; set; }

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
