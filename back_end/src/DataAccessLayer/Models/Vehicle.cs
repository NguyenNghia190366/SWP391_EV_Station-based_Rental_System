using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Vehicle")]
[Index("station_id", Name = "IX_Vehicle_station_id")]
[Index("license_plate", Name = "UQ__Vehicle__F72CD56ED24D7289", IsUnique = true)]
public partial class Vehicle
{
    [Key]
    public int vehicle_id { get; set; }

    [StringLength(50)]
    public string license_plate { get; set; } = null!;

    public int vehicle_model_id { get; set; }

    public int? release_year { get; set; }

    public int? battery_capacity { get; set; }

    public int current_mileage { get; set; }

    [StringLength(255)]
    public string? img_car_url { get; set; }

    [StringLength(20)]
    public string condition { get; set; } = null!;

    public bool is_available { get; set; }

    public int? station_id { get; set; }

    [Precision(3)]
    public DateTime created_at { get; set; }

    [InverseProperty("vehicle")]
    public virtual ICollection<RentalOrder> RentalOrders { get; set; } = new List<RentalOrder>();

    [ForeignKey("station_id")]
    [InverseProperty("Vehicles")]
    public virtual Station? station { get; set; }

    [ForeignKey("vehicle_model_id")]
    [InverseProperty("Vehicles")]
    public virtual Vehicle_Model vehicle_model { get; set; } = null!;
}
