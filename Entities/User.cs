using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string Role { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string Password_Hash { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    public DateTime? LastLogin { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<LogHistory> LogHistories { get; set; } = new List<LogHistory>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual Renter? Renter { get; set; }

    public virtual Staff? Staff { get; set; }
}
