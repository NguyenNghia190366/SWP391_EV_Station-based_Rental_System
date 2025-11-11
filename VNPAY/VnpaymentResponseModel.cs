namespace DEMO01_EV_rental_System.VNPAY
{
    public class VnpaymentResponseModel
    {
        public bool IsSuccess { get; set; }
        public string PaymentMethod { get; set; }
        public string OrderDesc { get; set; }
        public string OrderId { get; set; }

        public string PaymentId { get; set; }
        public string TransactionId { get; set; }

        public string Token { get; set; }

        public string VnpayResponseCode { get; set; }
    }
}
