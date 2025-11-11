using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccessLayer.Models;
[Table("Report_EV_Img")]
public partial class Report_EV_Img
{
    public int img_id { get; set; }
    public int? report_id { get; set; }
    public string? img_url { get; set; }

    public virtual Report? report { get; set; }
}