
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Identity.Client;

namespace DEMO01_EV_rental_System.VNPAY
{
    public class VnpayService : IVnPayService
    {

        private readonly IConfiguration _config;
        private readonly RentalEvSystemFinalContext _context;
        public VnpayService(IConfiguration config)
        {
            _config = config;
            _context = new RentalEvSystemFinalContext();
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
            pay.AddRequestData("vnp_CreateDate", TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById).ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _config["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _config["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", "Thanh Toan cho don hang: " + model.FullName);
            pay.AddRequestData("vnp_OrderType", "other");// Nó có thể sẽ thay đổi thông qua type bên requestmodel
            pay.AddRequestData("vnp_ReturnUrl", _config["Vnpay:ReturnUrl"]);
            //pay.AddRequestData("vnp_Orderid", model.OrderId.ToString());
            //pay.AddRequestData("vnp_TxnRef", tick);
            pay.AddRequestData("vnp_TxnRef", tick);
            var paymentUrl = pay.CreateRequestUrl(_config["Vnpay:PaymentUrl"], _config["Vnpay:HashSecret"]);
            //pay.AddRequestData("vnp_Orderid", model.OrderId.ToString());

            Payment payment = new Payment();
            payment.OrderId = model.OrderId;
            payment.Amount = (decimal)model.Amount;
            payment.PaymentStatus = "UNPAID";
            payment.PaymentMethod = "E-Wallet";
            payment.Type_payment = "PAY";
            payment.Payment_online_vnp_TxnRef = tick;
            _context.Payments.Add(payment);
            _context.SaveChanges();
            return paymentUrl;
        }

        public string CreatePaymentUrlWithAnPayment(HttpContext context, VnPaymentRequestModelWithAnPayment model)
        {
           

            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var util = new Utils();
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_config["TimeZoneId"]);

            pay.AddRequestData("vnp_Version", _config["Vnpay:ApiVersion"]);
            pay.AddRequestData("vnp_Command", _config["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _config["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", (model.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById).ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _config["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _config["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", "Thanh Toan cho don hang: " + model.FullName);
            pay.AddRequestData("vnp_OrderType", "other");// Nó có thể sẽ thay đổi thông qua type bên requestmodel
            pay.AddRequestData("vnp_ReturnUrl", _config["Vnpay:ReturnUrl"]);
            //pay.AddRequestData("vnp_Orderid", model.OrderId.ToString());
            //pay.AddRequestData("vnp_TxnRef", tick);
            pay.AddRequestData("vnp_TxnRef", tick);
            var paymentUrl = pay.CreateRequestUrl(_config["Vnpay:PaymentUrl"], _config["Vnpay:HashSecret"]);
            //pay.AddRequestData("vnp_Orderid", model.OrderId.ToString());

            var payment = _context.Payments.FirstOrDefault(x => x.PaymentId == model.PaymentId);
            if (payment != null)
            {
                payment.Payment_online_vnp_TxnRef = tick;
                _context.Payments.Update(payment);
                _context.SaveChanges();
            }


            return paymentUrl;
        }

        public string CreateRefundUrl(HttpContext context, VnPaymentRequestModel model)
        {


            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var util = new Utils();
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_config["TimeZoneId"]);

            pay.AddRequestData("vnp_Version", _config["Vnpay:ApiVersion"]);
            pay.AddRequestData("vnp_Command", _config["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _config["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", (model.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById).ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _config["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _config["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", "Thanh Toan cho don hang " + model.FullName);
            pay.AddRequestData("vnp_OrderType", "other");// Nó có thể sẽ thay đổi thông qua type bên requestmodel
            pay.AddRequestData("vnp_ReturnUrl", _config["Vnpay:ReturnUrl"]);
            //pay.AddRequestData("vnp_Orderid", model.OrderId.ToString());
            //pay.AddRequestData("vnp_TxnRef", tick);
            pay.AddRequestData("vnp_TxnRef", tick);
            var RefundUrl = pay.CreateRequestUrl(_config["Vnpay:PaymentUrl"], _config["Vnpay:HashSecret"]);
            //pay.AddRequestData("vnp_Orderid", model.OrderId.ToString());

            Payment payment = new Payment();
            payment.OrderId = model.OrderId;
            payment.Amount = (decimal)model.Amount;
            payment.PaymentStatus = "UNPAID";
            payment.PaymentMethod = "E-Wallet";
            payment.Type_payment = "REFUND";
            payment.Payment_online_vnp_TxnRef = tick;
            _context.Payments.Add(payment);
            _context.SaveChanges();
            return RefundUrl;
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
            var vnp_amount = pay.GetResponseData("vnp_Amount");
            bool checkSignature = pay.ValidateSignature(vnp_SecureHash, _config["Vnpay:HashSecret"]);
            if (!checkSignature)
            {
                return new VnpaymentResponseModel
                {
                    IsSuccess = false
                };
            }

            var payments = _context.Payments.ToList();
            var payment = new Payment();
            int orderId = 0;
            for(int i = 0; i < payments.Count; i++)
            {
                if (payments[i].Payment_online_vnp_TxnRef != null)
                {
                    if (payments[i].Payment_online_vnp_TxnRef.Equals((string)pay.GetResponseData("vnp_TxnRef"))){
                        payment = payments[i];
                        orderId = payments[i].OrderId;
                        payment.PaymentStatus = "PAID";
                        _context.Update(payment);
                        _context.SaveChanges();
                        break;
                    }
                }
            }
            return new VnpaymentResponseModel
            {
                IsSuccess = true,
                PaymentMethod = "VnPay",
                OrderDesc = vnp_OrderInfo,
                order_id = orderId,
                vnp_TxnRef = vnp_orderId.ToString(),
                TransactionId = vnp_TransactionId.ToString(),
                VnpayResponseCode = vnp_ResponseCode.ToString(),
                Token = vnp_SecureHash.ToString(),
                Amount = vnp_amount,
               

            };

           
        }

        public string GetFullNameById(int order_id)
        {
            var order = _context.RentalOrders.FirstOrDefault(x => x.OrderId == order_id);
            var renter = _context.Renters.FirstOrDefault(x => x.RenterId == order.RenterId);
            var user = _context.Users.FirstOrDefault(x => x.UserId == renter.UserId);
            return user.FullName;
        }
        }
}
