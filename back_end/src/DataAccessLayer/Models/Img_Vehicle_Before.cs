namespace DataAccessLayer.Models;

public partial class Img_Vehicle_Before
{
    public int img_before_ID { get; set; }

    public int? order_id { get; set; }

    public string? img_vehicle_before_URL { get; set; }

    public virtual RentalOrder? order { get; set; }
}