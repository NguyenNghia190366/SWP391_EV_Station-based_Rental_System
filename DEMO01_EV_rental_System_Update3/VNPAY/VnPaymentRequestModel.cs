using System.Security.Cryptography;

namespace DEMO01_EV_rental_System.VNPAY
{
    public class VnPaymentRequestModel
    {
        public int OrderId { get; set; }
        public string OrderType { get; set; }
        public string FullName { get; set; }

        public string Description { get; set; }

        public double Amount { get; set; }
        
    
    }
}
