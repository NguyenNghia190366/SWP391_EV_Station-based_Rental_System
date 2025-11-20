namespace DEMO01_EV_rental_System.VNPAY
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(HttpContext content, VnPaymentRequestModel model);
        VnpaymentResponseModel PaymentExcute(IQueryCollection collections);

        public string CreateRefundUrl(HttpContext context, VnPaymentRequestModel model);

        public string CreatePaymentUrlWithAnPayment(HttpContext context, VnPaymentRequestModelWithAnPayment model);
        //VnpaymentResponseModel ProcessPaymentResponse(HttpRequest request);
    }
}
