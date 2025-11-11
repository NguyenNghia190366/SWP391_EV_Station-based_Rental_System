using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccessLayer.Models;

[Table("Img_Vehicle_After")]
public partial class Img_Vehicle_After
{
    public int img_after_ID { get; set; }

    public int? order_id { get; set; }

    public string? img_vehicle_after_URL { get; set; }

    public virtual RentalOrder? order { get; set; }
}