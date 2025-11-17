using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class ExtraFee
{
    public int FeeId { get; set; }

    public int OrderId { get; set; }

    public int FeeTypeId { get; set; }

    public string? Description { get; set; }
    public string? FeeName { get; set; }

    public DateTime CreatedAt { get; set; }

    public decimal Amount { get; set; }

    public virtual FeeType FeeType { get; set; } = null!;

    public virtual RentalOrder Order { get; set; } = null!;
}
