using System;
using System.Collections.Generic;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CCCD> CCCDs { get; set; }

    public virtual DbSet<Complaint> Complaints { get; set; }

    public virtual DbSet<Contract> Contracts { get; set; }

    public virtual DbSet<Driver_License> Driver_Licenses { get; set; }

    public virtual DbSet<ExtraFee> ExtraFees { get; set; }

    public virtual DbSet<FeeType> FeeTypes { get; set; }

    public virtual DbSet<Log_History> Log_Histories { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<RentalOrder> RentalOrders { get; set; }

    public virtual DbSet<Renter> Renters { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<Station> Stations { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<Vehicle_Model> Vehicle_Models { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-F35FAEM\\SQLEXPRESS;uid=sa;pwd=12345;Database=rental_ev_system;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CCCD>(entity =>
        {
            entity.HasKey(e => e.renter_id).HasName("PK__CCCD__50438F0BFEF88F1A");

            entity.Property(e => e.renter_id).ValueGeneratedNever();

            entity.HasOne(d => d.renter).WithOne(p => p.CCCD).HasConstraintName("FK_CCCD_Renter");
        });

        modelBuilder.Entity<Complaint>(entity =>
        {
            entity.HasKey(e => e.complaint_id).HasName("PK__Complain__A771F61C1122045B");

            entity.Property(e => e.created_date).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.status).HasDefaultValue("PROCESSING");

            entity.HasOne(d => d.order).WithMany(p => p.Complaints).HasConstraintName("FK_Complaint_Order");

            entity.HasOne(d => d.renter).WithMany(p => p.Complaints).HasConstraintName("FK_Complaint_Renter");
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasKey(e => e.contract_id).HasName("PK__Contract__F8D6642363661016");

            entity.Property(e => e.signed_date).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.order).WithOne(p => p.Contract).HasConstraintName("FK_Contract_Order");

            entity.HasOne(d => d.staff).WithMany(p => p.Contracts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Contract_Staff");
        });

        modelBuilder.Entity<Driver_License>(entity =>
        {
            entity.HasKey(e => e.renter_id).HasName("PK__Driver_L__50438F0BF230DD84");

            entity.Property(e => e.renter_id).ValueGeneratedNever();

            entity.HasOne(d => d.renter).WithOne(p => p.Driver_License).HasConstraintName("FK_DriverLicense_Renter");
        });

        modelBuilder.Entity<ExtraFee>(entity =>
        {
            entity.HasKey(e => e.fee_id).HasName("PK__ExtraFee__A19C8AFB3C7ECCEC");

            entity.Property(e => e.created_at).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.FeeType).WithMany(p => p.ExtraFees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ExtraFee_FeeType");

            entity.HasOne(d => d.order).WithMany(p => p.ExtraFees).HasConstraintName("FK_ExtraFee_Order");
        });

        modelBuilder.Entity<FeeType>(entity =>
        {
            entity.HasKey(e => e.FeeType_id).HasName("PK__FeeType__91551701460FAAEB");
        });

        modelBuilder.Entity<Log_History>(entity =>
        {
            entity.HasKey(e => e.log_id).HasName("PK__Log_Hist__9E2397E06D9FD342");

            entity.Property(e => e.log_date).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.user).WithMany(p => p.Log_Histories)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_LogHistory_User");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.notification_id).HasName("PK__Notifica__E059842FE7911EE4");

            entity.Property(e => e.created_at).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.user).WithMany(p => p.Notifications).HasConstraintName("FK_Notification_User");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.payment_id).HasName("PK__Payment__ED1FC9EAB5A713F1");

            entity.Property(e => e.payment_date).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.order).WithMany(p => p.Payments).HasConstraintName("FK_Payment_Order");
        });

        modelBuilder.Entity<RentalOrder>(entity =>
        {
            entity.HasKey(e => e.order_id).HasName("PK__RentalOr__465962299223810B");

            entity.Property(e => e.created_at).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.payment_status).HasDefaultValue("UNPAID");
            entity.Property(e => e.status).HasDefaultValue("BOOKED");

            entity.HasOne(d => d.pickup_station).WithMany(p => p.RentalOrderpickup_stations).HasConstraintName("FK_Order_PickupStation");

            entity.HasOne(d => d.renter).WithMany(p => p.RentalOrders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Renter");

            entity.HasOne(d => d.return_station).WithMany(p => p.RentalOrderreturn_stations).HasConstraintName("FK_Order_ReturnStation");

            entity.HasOne(d => d.vehicle).WithMany(p => p.RentalOrders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Order_Vehicle");
        });

        modelBuilder.Entity<Renter>(entity =>
        {
            entity.HasKey(e => e.renter_id).HasName("PK__Renter__50438F0BCD5F9D4C");

            entity.Property(e => e.registration_date).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.user).WithOne(p => p.Renter).HasConstraintName("FK_Renter_User");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.staff_id).HasName("PK__Staff__1963DD9C40E09D73");

            entity.HasOne(d => d.station).WithMany(p => p.Staff)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Staff_Station");

            entity.HasOne(d => d.user).WithOne(p => p.Staff).HasConstraintName("FK_Staff_User");
        });

        modelBuilder.Entity<Station>(entity =>
        {
            entity.HasKey(e => e.station_id).HasName("PK__Station__44B370E953A7C5F8");

            entity.Property(e => e.created_at).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.user_id).HasName("PK__Users__B9BE370FD905887A");

            entity.Property(e => e.created_at).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.role).HasDefaultValue("RENTER");
            entity.Property(e => e.status).HasDefaultValue("Active");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.vehicle_id).HasName("PK__Vehicle__F2947BC1EFAC3A9E");

            entity.Property(e => e.condition).HasDefaultValue("GOOD");
            entity.Property(e => e.created_at).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.is_available).HasDefaultValue(true);

            entity.HasOne(d => d.station).WithMany(p => p.Vehicles)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Vehicle_Station");

            entity.HasOne(d => d.vehicle_model).WithMany(p => p.Vehicles)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Vehicle_VehicleModel");
        });

        modelBuilder.Entity<Vehicle_Model>(entity =>
        {
            entity.HasKey(e => e.vehicle_model_id).HasName("PK__Vehicle___79AAE30DA73640ED");

            entity.Property(e => e.number_of_seats).HasDefaultValue(1);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
