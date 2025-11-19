using System;
using System.Collections.Generic;
using DEMO01_EV_rental_System.Entities;
using Microsoft.EntityFrameworkCore;

namespace DEMO01_EV_rental_System.Data;

public partial class RentalEvSystemFinalContext : DbContext
{
    public RentalEvSystemFinalContext()
    {
    }

    public RentalEvSystemFinalContext(DbContextOptions<RentalEvSystemFinalContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cccd> Cccds { get; set; }

    public virtual DbSet<Complaint> Complaints { get; set; }

    public virtual DbSet<Contract> Contracts { get; set; }

    public virtual DbSet<DriverLicense> DriverLicenses { get; set; }

    public virtual DbSet<ExtraFee> ExtraFees { get; set; }

    public virtual DbSet<FeeType> FeeTypes { get; set; }

    public virtual DbSet<LogHistory> LogHistories { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<RentalOrder> RentalOrders { get; set; }

    public virtual DbSet<Renter> Renters { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<Station> Stations { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<VehicleModel> VehicleModels { get; set; }
    private string GetConnectionString()
    {
        IConfiguration config = new ConfigurationBuilder()
             .SetBasePath(AppContext.BaseDirectory)
                    .AddJsonFile("appsettings.json", true, true)
                    .Build();
        var strConn = config["ConnectionStrings:DefaultConnection"];
        if (string.IsNullOrEmpty(strConn))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found in appsettings.json.");
        }
        return strConn;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(GetConnectionString());
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cccd>(entity =>
        {
            entity.HasKey(e => e.Renter_Id).HasName("PK__CCCD__50438F0BA98DEC37");

            entity.ToTable("CCCD");

            entity.HasIndex(e => e.id_Card_Number, "UQ__CCCD__7B15C0488357F508").IsUnique();

            entity.Property(e => e.Renter_Id)
                .ValueGeneratedNever()
                .HasColumnName("renter_id");
            entity.Property(e => e.id_Card_Number)
                .HasMaxLength(50)
                .HasColumnName("id_card_number");
            entity.Property(e => e.url_Cccd_Cmnd_front)
                .HasMaxLength(255)
                .HasColumnName("url_cccd_cmnd_front");
            entity.Property(e => e.url_Cccd_Cmnd_back)
                .HasMaxLength(255)
                .HasColumnName("url_cccd_cmnd_back");

            entity.HasOne(d => d.renter).WithOne(p => p.Cccd)
                .HasForeignKey<Cccd>(d => d.Renter_Id)
                .HasConstraintName("FK_CCCD_Renter");
        });

        modelBuilder.Entity<Complaint>(entity =>
        {
            entity.HasKey(e => e.complaint_Id).HasName("PK__Complain__A771F61C01D41E58");

            entity.ToTable("Complaint");

            entity.HasIndex(e => e.order_Id, "IX_Complaint_order_id");

            entity.Property(e => e.complaint_Id).HasColumnName("complaint_id");
            entity.Property(e => e.created_Date)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_date");
            entity.Property(e => e.description).HasColumnName("description");
            entity.Property(e => e.order_Id).HasColumnName("order_id");
            entity.Property(e => e.renter_Id).HasColumnName("renter_id");
            entity.Property(e => e.resolve_Date)
                .HasPrecision(3)
                .HasColumnName("resolve_date");
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValue("PROCESSING")
                .HasColumnName("status");

            entity.HasOne(d => d.order).WithMany(p => p.Complaints)
                .HasForeignKey(d => d.order_Id)
                .HasConstraintName("FK_Complaint_Order");

            entity.HasOne(d => d.renter).WithMany(p => p.Complaints)
                .HasForeignKey(d => d.renter_Id)
                .HasConstraintName("FK_Complaint_Renter");
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasKey(e => e.ContractId).HasName("PK__Contract__F8D6642348F555A3");

            entity.ToTable("Contract");

            entity.HasIndex(e => e.OrderId, "UQ__Contract__4659622848EBFBAA").IsUnique();

            entity.Property(e => e.ContractId).HasColumnName("contract_id");
            entity.Property(e => e.ContractPdfUrl)
                .HasMaxLength(255)
                .HasColumnName("contract_pdf_url");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.SignedDate)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("signed_date");
            entity.Property(e => e.StaffId).HasColumnName("staff_id");

            entity.HasOne(d => d.Order).WithOne(p => p.Contract)
                .HasForeignKey<Contract>(d => d.OrderId)
                .HasConstraintName("FK_Contract_Order");

            entity.HasOne(d => d.Staff).WithMany(p => p.Contracts)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Contract_Staff");
        });

        modelBuilder.Entity<DriverLicense>(entity =>
        {
            entity.HasKey(e => e.Renter_Id).HasName("PK__Driver_L__50438F0B35A50651");

            entity.ToTable("Driver_License");

            entity.HasIndex(e => e.DriverLicenseNumber, "UQ__Driver_L__4A36048F7D62AA9E").IsUnique();

            entity.Property(e => e.Renter_Id)
                .ValueGeneratedNever()
                .HasColumnName("renter_id");
            entity.Property(e => e.DriverLicenseNumber)
                .HasMaxLength(50)
                .HasColumnName("driver_license_number");
            entity.Property(e => e.url_Driver_License_front)
                .HasMaxLength(255)
                .HasColumnName("url_driver_license_front");
            entity.Property(e => e.url_Driver_License_back)
                .HasMaxLength(255)
                .HasColumnName("url_driver_license_back");

            entity.HasOne(d => d.Renter).WithOne(p => p.DriverLicense)
                .HasForeignKey<DriverLicense>(d => d.Renter_Id)
                .HasConstraintName("FK_DriverLicense_Renter");
        });

        modelBuilder.Entity<ExtraFee>(entity =>
        {
            entity.HasKey(e => e.FeeId).HasName("PK__ExtraFee__A19C8AFB178E6276");

            entity.ToTable("ExtraFee");

            entity.HasIndex(e => e.FeeTypeId, "IX_ExtraFee_FeeType_id");

            entity.HasIndex(e => e.OrderId, "IX_ExtraFee_order_id");

            entity.Property(e => e.FeeId).HasColumnName("fee_id");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FeeTypeId).HasColumnName("FeeType_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");

            entity.HasOne(d => d.FeeType).WithMany(p => p.ExtraFees)
                .HasForeignKey(d => d.FeeTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ExtraFee_FeeType");
            entity.Property(e => e.Amount)
               .HasColumnType("decimal(12, 2)")
               .HasColumnName("amount");
            entity.Property(e => e.FeeName)
                .HasMaxLength(255)
                .HasColumnName("FeeName");
            entity.HasOne(d => d.Order).WithMany(p => p.ExtraFees)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_ExtraFee_Order");
        });

        modelBuilder.Entity<FeeType>(entity =>
        {
            entity.HasKey(e => e.FeeTypeId).HasName("PK__FeeType__9155170136AC1F93");

            entity.ToTable("FeeType");

            entity.HasIndex(e => e.FeeType1, "UQ__FeeType__A2FC90DB41BFF209").IsUnique();

            entity.Property(e => e.FeeTypeId).HasColumnName("FeeType_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(12, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.FeeType1)
                .HasMaxLength(100)
                .HasColumnName("FeeType");
        });

        modelBuilder.Entity<LogHistory>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__Log_Hist__9E2397E014E12EFD");

            entity.ToTable("Log_History");

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.Action).HasColumnName("action");
            entity.Property(e => e.LogDate)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("log_date");
            entity.Property(e => e.LogType)
                .HasMaxLength(50)
                .HasColumnName("log_type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.LogHistories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_LogHistory_User");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__E059842FC989EF0F");

            entity.ToTable("Notification");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Notification_User");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EA589705CF");

            entity.ToTable("Payment");

            entity.HasIndex(e => e.OrderId, "IX_Payment_order_id");

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(12, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(20)
                .HasDefaultValue("UNPAID")
                .HasColumnName("payment_status");
            entity.Property(e => e.ExternalRef)
                .HasMaxLength(255)
                .HasColumnName("external_ref");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentDate)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("payment_date");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50)
                .HasColumnName("payment_method");
            entity.Property(e => e.Type_payment)
               .HasMaxLength(50)
               .HasColumnName("type_payment");
            entity.Property(e => e.Payment_online_vnp_TxnRef)
               .HasMaxLength(100)
               .HasColumnName("payment_online_vnp_TxnRef");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_Payment_Order");
        });

        modelBuilder.Entity<RentalOrder>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__RentalOr__465962297D9E818F");

            entity.ToTable("RentalOrder");

            entity.HasIndex(e => e.PickupStationId, "IX_RentalOrder_pickup_station_id");

            entity.HasIndex(e => e.RenterId, "IX_RentalOrder_renter_id");

            entity.HasIndex(e => e.ReturnStationId, "IX_RentalOrder_return_station_id");

            entity.HasIndex(e => e.VehicleId, "IX_RentalOrder_vehicle_id");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            //entity.Property(e => e.DepositAmount)
            //    .HasColumnType("decimal(12, 2)")
            //    .HasColumnName("deposit_amount");
            
            entity.Property(e => e.EndTime)
                .HasPrecision(3)
                .HasColumnName("end_time");
            entity.Property(e => e.ImgVehicleAfterUrl)
                .HasMaxLength(255)
                .HasColumnName("img_vehicle_after_URL");
            entity.Property(e => e.ImgVehicleBeforeUrl)
                .HasMaxLength(255)
                .HasColumnName("img_vehicle_before_URL");
            
            entity.Property(e => e.PickupStationId).HasColumnName("pickup_station_id");
            entity.Property(e => e.RenterId).HasColumnName("renter_id");
            entity.Property(e => e.ReturnStationId).HasColumnName("return_station_id");
            entity.Property(e => e.StartTime)
                .HasPrecision(3)
                .HasColumnName("start_time");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("BOOKED")
                .HasColumnName("status");
            //entity.Property(e => e.TotalAmount)
            //    .HasColumnType("decimal(12, 2)")
            //    .HasColumnName("total_amount");
            entity.Property(e => e.VehicleId).HasColumnName("vehicle_id");

            entity.HasOne(d => d.PickupStation).WithMany(p => p.RentalOrderPickupStations)
                .HasForeignKey(d => d.PickupStationId)
                .HasConstraintName("FK_Order_PickupStation");

            entity.HasOne(d => d.Renter).WithMany(p => p.RentalOrders)
                .HasForeignKey(d => d.RenterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Renter");

            entity.HasOne(d => d.ReturnStation).WithMany(p => p.RentalOrderReturnStations)
                .HasForeignKey(d => d.ReturnStationId)
                .HasConstraintName("FK_Order_ReturnStation");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.RentalOrders)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Vehicle");
        });

        modelBuilder.Entity<Renter>(entity =>
        {
            entity.HasKey(e => e.RenterId).HasName("PK__Renter__50438F0BBBAF8E8E");

            entity.ToTable("Renter");

            entity.HasIndex(e => e.UserId, "UQ__Renter__B9BE370E5F33EB0B").IsUnique();

            entity.Property(e => e.RenterId).HasColumnName("renter_id");
            entity.Property(e => e.CurrentAddress)
                .HasMaxLength(255)
                .HasColumnName("current_address");
            entity.Property(e => e.IsVerified).HasColumnName("is_verified");
            entity.Property(e => e.RegistrationDate)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("registration_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Renter)
                .HasForeignKey<Renter>(d => d.UserId)
                .HasConstraintName("FK_Renter_User");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.StaffId).HasName("PK__Staff__1963DD9CF275CE2E");

            entity.HasIndex(e => e.UserId, "UQ__Staff__B9BE370E7611F27E").IsUnique();

            entity.Property(e => e.StaffId).HasColumnName("staff_id");
            entity.Property(e => e.StationId).HasColumnName("station_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Station).WithMany(p => p.Staff)
                .HasForeignKey(d => d.StationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Staff_Station");

            entity.HasOne(d => d.User).WithOne(p => p.Staff)
                .HasForeignKey<Staff>(d => d.UserId)
                .HasConstraintName("FK_Staff_User");
        });

        modelBuilder.Entity<Station>(entity =>
        {
            entity.HasKey(e => e.StationId).HasName("PK__Station__44B370E9D4110C6C");

            entity.ToTable("Station");

            entity.Property(e => e.StationId).HasColumnName("station_id");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .HasColumnName("address");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Latitude)
                .HasColumnType("decimal(10, 8)")
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasColumnType("decimal(11, 8)")
                .HasColumnName("longitude");
            entity.Property(e => e.StationName)
                .HasMaxLength(255)
                .HasColumnName("station_name");
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .HasColumnName("status");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370FCAE4724F");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E61646916F026").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.LastLogin)
                .HasPrecision(3)
                .HasColumnName("last_login");
            entity.Property(e => e.Password_Hash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.Role)
                .HasMaxLength(10)
                .HasDefaultValue("RENTER")
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .HasDefaultValue("Active")
                .HasColumnName("status");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId).HasName("PK__Vehicle__F2947BC1CEFAA04C");

            entity.ToTable("Vehicle");

            entity.HasIndex(e => e.StationId, "IX_Vehicle_station_id");

            entity.HasIndex(e => e.LicensePlate, "UQ__Vehicle__F72CD56E82A9B0CC").IsUnique();

            entity.Property(e => e.VehicleId).HasColumnName("vehicle_id");
            entity.Property(e => e.BatteryCapacity).HasColumnName("battery_capacity");
            entity.Property(e => e.Condition)
                .HasMaxLength(20)
                .HasDefaultValue("GOOD")
                .HasColumnName("condition");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Model)
                .HasMaxLength(100)
                .HasColumnName("model");
            entity.Property(e => e.CurrentMileage).HasColumnName("current_mileage");
            entity.Property(e => e.ImgCarUrl)
                .HasMaxLength(255)
                .HasColumnName("img_car_url");
            entity.Property(e => e.IsAvailable)
                .HasDefaultValue(true)
                .HasColumnName("is_available");
            entity.Property(e => e.LicensePlate)
                .HasMaxLength(50)
                .HasColumnName("license_plate");
            
            entity.Property(e => e.ReleaseYear).HasColumnName("release_year");
            entity.Property(e => e.StationId).HasColumnName("station_id");
            entity.Property(e => e.VehicleModelId).HasColumnName("vehicle_model_id");

            entity.HasOne(d => d.Station).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.StationId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Vehicle_Station");

            entity.HasOne(d => d.VehicleModel).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.VehicleModelId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Vehicle_VehicleModel");
        });

        modelBuilder.Entity<VehicleModel>(entity =>
        {
            entity.HasKey(e => e.VehicleModelId).HasName("PK__Vehicle___79AAE30D56B1DAC6");

            entity.ToTable("Vehicle_Model");

            entity.Property(e => e.VehicleModelId).HasColumnName("vehicle_model_id");
            entity.Property(e => e.BrandName)
                .HasMaxLength(100)
                .HasColumnName("brand_name");
            entity.Property(e => e.price_per_hour)
                 .HasColumnType("decimal(12, 2)")
                 .HasColumnName("price_per_hour");
            entity.Property(e => e.Mileage).HasColumnName("mileage");
            entity.Property(e => e.NumberOfSeats)
                .HasDefaultValue(1)
                .HasColumnName("number_of_seats");
            entity.Property(e => e.VehicleColor)
                .HasMaxLength(50)
                .HasColumnName("vehicle_color");
            entity.Property(e => e.Model).HasDefaultValue(100).HasColumnName("model_name");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
