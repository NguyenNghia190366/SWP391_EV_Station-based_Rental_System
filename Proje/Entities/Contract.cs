using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class Contract
{
    public int ContractId { get; set; }

    public int StaffId { get; set; }

    public int OrderId { get; set; }

    public DateTime SignedDate { get; set; }

    public string? ContractPdfUrl { get; set; }

    public virtual RentalOrder Order { get; set; } = null!;

    public virtual Staff Staff { get; set; } = null!;
}
