using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public DateTime PaymentDate { get; set; }

    public string? ExternalRef { get; set; }

    public virtual RentalOrder Order { get; set; } = null!;
}
