namespace DEMO01_EV_rental_System.VNPAY
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(HttpContext content, VnPaymentRequestModel model);
        VnpaymentResponseModel PaymentExcute(IQueryCollection collections);
        //VnpaymentResponseModel ProcessPaymentResponse(HttpRequest request);
    }
}
