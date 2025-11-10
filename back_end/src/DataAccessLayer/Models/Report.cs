using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Report
{
    public Report()
    {
        Report_EV_Imgs = new HashSet<Report_EV_Img>();
    }

    public int report_id { get; set; }
    public int staff_id { get; set; }
    public int order_id { get; set; }
    public string? detail { get; set; }

    public virtual RentalOrder order { get; set; } = null!;
    public virtual Staff staff { get; set; } = null!;
    public virtual ICollection<Report_EV_Img> Report_EV_Imgs { get; set; }
}