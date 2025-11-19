using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace DEMO01_EV_rental_System.VNPAY
{
    public class VnPaymentRequestModelWithAnPayment
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public string OrderType { get; set; }
        public string FullName { get; set; }

        public string Description { get; set; }

        public double Amount { get; set; }
    }
}
