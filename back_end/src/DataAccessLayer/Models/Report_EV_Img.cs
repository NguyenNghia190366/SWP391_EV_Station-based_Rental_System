using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Report_EV_Img
{
    public int img_id { get; set; }
    public int? report_id { get; set; }
    public string? img_url { get; set; }

    public virtual Report? report { get; set; }
}