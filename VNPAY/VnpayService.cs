
namespace DEMO01_EV_rental_System.VNPAY
{
    public class VnpayService : IVnPayService
    {

        private readonly IConfiguration _config;
        public VnpayService(IConfiguration config)
        {
            _config = config;
        }
        public string CreatePaymentUrl(HttpContext context, VnPaymentRequestModel model)
        {
            
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var util = new Utils();
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_config["TimeZoneId"]);
                
            pay.AddRequestData("vnp_Version", _config["Vnpay:ApiVersion"]);
            pay.AddRequestData("vnp_Command", _config["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _config["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", (model.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById).ToString());
            pay.AddRequestData("vnp_CurrCode", _config["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _config["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", "Thanh Toán cho đơn hàng: " + model.FullName);
            pay.AddRequestData("vnp_OrderType", "OrderType");// Nó có thể sẽ thay đổi thông qua type bên requestmodel
            pay.AddRequestData("vnp_ReturnUrl", _config["Vnpay:ReturnUrl"]);
            pay.AddRequestData("vnp_TxnRef", tick);
            var paymentUrl = pay.CreateRequestUrl(_config["Vnpay:PaymentUrl"], _config["Vnpay:HashSecret"]);
            return paymentUrl;
        }
    //    "ReturnUrl": 
    //"TmnCode": "",
    //"HashSecret": "",
    //"PaymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    //"ApiUrl": "https://sandbox.vnpayment.vn/merchant_webapi/merchant.html",
    //"ApiVersion": "2.1.0",
    //"Command": "pay",
    //"CurrCode": "VND",
    //"Locale": "vn"

        public VnpaymentResponseModel PaymentExcute(IQueryCollection collections)
        {
            var pay = new VnPayLibrary();
            foreach(var (key, value) in collections)
            {
                if(!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    pay.AddResponseData(key, value.ToString());
                }
            }
            var vnp_orderId = Convert.ToInt64(pay.GetResponseData("vnp_TxnRef"));
            var vnp_TransactionId = Convert.ToInt64(pay.GetResponseData("vnp_TransactionNo"));
            var vnp_SecureHash = collections.FirstOrDefault(p => p.Key == "vnp_SecureHash").Value;
            var vnp_ResponseCode = pay.GetResponseData("vnp_ResponseCode");
            var vnp_OrderInfo = pay.GetResponseData("vnp_OrderInfo");
            bool checkSignature = pay.ValidateSignature(vnp_SecureHash, _config["Vnpay:HashSecret"]);
            if (!checkSignature)
            {
                return new VnpaymentResponseModel
                {
                    IsSuccess = false
                };
            }

            return new VnpaymentResponseModel
            {
                IsSuccess = true,
                PaymentMethod = "VnPay",
                OrderDesc = vnp_OrderInfo,
                OrderId = vnp_orderId.ToString(),
                TransactionId = vnp_TransactionId.ToString(),
                VnpayResponseCode = vnp_ResponseCode.ToString()

            };
        }
    }
}
