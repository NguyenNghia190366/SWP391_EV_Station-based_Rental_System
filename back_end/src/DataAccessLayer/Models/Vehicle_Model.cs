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
    
    [Required] // Vì ta set là NOT NULL
    [StringLength(100)]
    [Column("model_name")]
    public string model_name { get; set; } = null!;

    [StringLength(50)]
    public string? vehicle_color { get; set; }

    public int number_of_seats { get; set; }

    public decimal? battery_capacity { get; set; } // 

    public string type_of_battery { get; set; } = null!;
    
    public int? mileage { get; set; }
    
    public decimal price_per_hour { get; set; } // 
    
    public decimal deposit { get; set; }

    [InverseProperty("vehicle_model")]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
