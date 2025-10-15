using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Vehicle_Model")]
public partial class Vehicle_Model
{
    [Key]
    public int vehicle_model_id { get; set; }

    [StringLength(100)]
    public string brand_name { get; set; } = null!;

    [StringLength(50)]
    public string? vehicle_color { get; set; }

    public int number_of_seats { get; set; }

    public int? mileage { get; set; }

    [InverseProperty("vehicle_model")]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
