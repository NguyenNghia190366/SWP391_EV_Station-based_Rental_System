using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("Station")]
public partial class Station
{
    [Key]
    public int station_id { get; set; }

    [StringLength(255)]
    public string station_name { get; set; } = null!;

    [StringLength(500)]
    public string address { get; set; } = null!;

    [Column(TypeName = "decimal(10, 8)")]
    public decimal? latitude { get; set; }

    [Column(TypeName = "decimal(11, 8)")]
    public decimal? longitude { get; set; }

    [StringLength(10)]
    public string status { get; set; } = null!;

    public int capacity { get; set; }

    [Precision(3)]
    public DateTime created_at { get; set; }

    [InverseProperty("pickup_station")]
    public virtual ICollection<RentalOrder> RentalOrderpickup_stations { get; set; } = new List<RentalOrder>();

    [InverseProperty("return_station")]
    public virtual ICollection<RentalOrder> RentalOrderreturn_stations { get; set; } = new List<RentalOrder>();

    [InverseProperty("station")]
    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();

    [InverseProperty("station")]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
