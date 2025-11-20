using System;
using System.Collections.Generic;

namespace DEMO01_EV_rental_System.Entities;

public partial class FeeType
{
    public int FeeTypeId { get; set; }

    public string FeeType1 { get; set; } = null!;

    public decimal Amount { get; set; }

    public virtual ICollection<ExtraFee> ExtraFees { get; set; } = new List<ExtraFee>();
}
