using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Models;

[Table("RentalOrder")]
[Index("pickup_station_id", Name = "IX_RentalOrder_pickup_station_id")]
[Index("renter_id", Name = "IX_RentalOrder_renter_id")]
[Index("return_station_id", Name = "IX_RentalOrder_return_station_id")]
[Index("vehicle_id", Name = "IX_RentalOrder_vehicle_id")]
public partial class RentalOrder
{
    public RentalOrder()
    {
        Img_Vehicle_Befores = new HashSet<Img_Vehicle_Before>();
        Img_Vehicle_Afters = new HashSet<Img_Vehicle_After>();
    }


    [Key]
    public int order_id { get; set; }

    public int renter_id { get; set; }

    public int vehicle_id { get; set; }

    public int? pickup_station_id { get; set; }

    public int? return_station_id { get; set; }

    // THÊM CÁC DÒNG MỚI NÀY:
    public int? pickup_staff_id { get; set; }
    public string? pickup_staff_cccd_number { get; set; }
    public int? return_staff_id { get; set; }
    public string? return_staff_cccd_number { get; set; }

    [Precision(3)]
    public DateTime start_time { get; set; }

    [Precision(3)]
    public DateTime? end_time { get; set; }

    [Column(TypeName = "decimal(12, 2)")]
    public decimal total_amount { get; set; }

    [Column(TypeName = "decimal(12, 2)")]
    public decimal deposit_amount { get; set; }

    [StringLength(20)]
    public string payment_status { get; set; } = null!;

    [StringLength(50)]
    public string status { get; set; } = null!;

    [Precision(3)]
    public DateTime created_at { get; set; }

    [InverseProperty("order")]
    public virtual ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();

    [InverseProperty("order")]
    public virtual Contract? Contract { get; set; }

    [InverseProperty("order")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [ForeignKey("pickup_station_id")]
    [InverseProperty("RentalOrderpickup_stations")]
    public virtual Station? pickup_station { get; set; }

    [ForeignKey("renter_id")]
    [InverseProperty("RentalOrders")]
    public virtual Renter renter { get; set; } = null!;

    [ForeignKey("return_station_id")]
    [InverseProperty("RentalOrderreturn_stations")]
    public virtual Station? return_station { get; set; }

    [ForeignKey("vehicle_id")]
    [InverseProperty("RentalOrders")]
    public virtual Vehicle vehicle { get; set; } = null!;
    // THÊM 2 NAVIGATION PROPERTIES MỚI (ở cuối file):
    public virtual Staff? pickup_staff { get; set; }
    public virtual Staff? return_staff { get; set; }

    public virtual ICollection<Img_Vehicle_Before> Img_Vehicle_Befores { get; set; }
    public virtual ICollection<Img_Vehicle_After> Img_Vehicle_Afters { get; set; }
}
