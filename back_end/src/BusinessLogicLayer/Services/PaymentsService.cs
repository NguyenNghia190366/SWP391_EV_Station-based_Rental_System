using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.DTOs.Payment.VNPAY;
using BusinessLogicLayer.Helpers;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BusinessLogicLayer.Services
{
    public class PaymentsService : IPaymentsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpClientFactory _httpClientFactory;
        
        // CONFIG SETTINGS
        private readonly MomoSettings _momoSettings;
        private readonly VnpaySettings _vnpaySettings;

        // Helpers
         private readonly IHttpContextAccessor _httpContextAccessor;

        public PaymentsService(ApplicationDbContext context,
                               IOptions<MomoSettings> momoSettings,
                               IOptions<VnpaySettings> vnpaySettings,
                               IHttpClientFactory httpClientFactory,
                               IMapper mapper,
                               IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _momoSettings = momoSettings.Value;
            _vnpaySettings = vnpaySettings.Value;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        public async Task<PaymentInitResponseDto> CreateMoMoPaymentRequestAsync(PaymentInitiationDto dto, int renterId)
        {
            // 1. Tìm đơn hàng
            var order = await _context.RentalOrders
                .FirstOrDefaultAsync(o => o.order_id == dto.OrderId);

            if (order == null)
                throw new KeyNotFoundException("Không tìm thấy đơn hàng.");
            
            // 2. Xác thực chủ đơn hàng
            if (order.renter_id != renterId)
                throw new UnauthorizedAccessException("Bạn không có quyền thanh toán cho đơn hàng này.");

            // 3. Kiểm tra trạng thái thanh toán
            if (order.payment_status == "PAID")
                throw new InvalidOperationException("Đơn hàng này đã được thanh toán.");

            // 4. Chuẩn bị dữ liệu gửi MoMo
            string amount = order.deposit_amount.ToString("F0"); // MoMo yêu cầu string, không có phần thập phân
            string orderId = order.order_id.ToString() + "_" + Guid.NewGuid().ToString(); // Đảm bảo OrderId là duy nhất
            string requestId = Guid.NewGuid().ToString();
            string extraData = ""; // Có thể encode base64 nếu cần
            string orderInfo = $"Thanh toan don hang {order.order_id}";

            // 5. *** TẠO CHỮ KÝ (Signature) ***
            // Chuỗi raw (string) để tạo chữ ký
            string rawHash = $"accessKey={_momoSettings.AccessKey}" +
                             $"&amount={amount}" +
                             $"&extraData={extraData}" +
                             $"&ipnUrl={_momoSettings.IpnUrl}" +
                             $"&orderId={orderId}" +
                             $"&orderInfo={orderInfo}" +
                             $"&partnerCode={_momoSettings.PartnerCode}" +
                             $"&redirectUrl={_momoSettings.RedirectUrl}" +
                             $"&requestId={requestId}" +
                             "&requestType=captureWallet";

            string signature = SecurityHelper.CreateHmacSha256(rawHash, _momoSettings.SecretKey);

            // 6. Tạo body request
            var requestBody = new 
            {
                partnerCode = _momoSettings.PartnerCode,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl = _momoSettings.RedirectUrl,
                ipnUrl = _momoSettings.IpnUrl,
                extraData,
                requestType = "captureWallet",
                signature,
                lang = "vi"
            };

            // 7. Gọi API MoMo
            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(_momoSettings.ApiEndpoint, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                // --- SỬA LẠI ĐỂ ĐỌC LỖI THẬT SỰ ---
                string errorContent = await response.Content.ReadAsStringAsync();
                
                // Ném lỗi này ra để Swagger hiển thị
                throw new Exception($"Lỗi từ MoMo: {response.StatusCode}. Nội dung: {errorContent}");
            }

            var momoResponse = await response.Content.ReadFromJsonAsync<PaymentInitResponseDto>();
            
            // 8. Trả về payUrl cho Frontend
            return momoResponse!;
        }

        public async Task ProcessMomoIpnAsync(MomoIpnDto payload)
        {
            // 1. *** XÁC THỰC CHỮ KÝ (CỰC KỲ QUAN TRỌNG) ***
            // Kiểm tra xem request này có thực sự đến từ MoMo không
            string rawHash = $"accessKey={_momoSettings.AccessKey}" +
                             $"&amount={payload.Amount}" +
                             $"&extraData={payload.ExtraData}" +
                             $"&message={payload.Message}" +
                             $"&orderId={payload.OrderId}" +
                             $"&orderInfo={payload.OrderInfo}" +
                             $"&orderType={payload.OrderType}" +
                             $"&partnerCode={payload.PartnerCode}" +
                             $"&payType={payload.PayType}" +
                             $"&requestId={payload.RequestId}" +
                             $"&responseTime={payload.ResponseTime}" +
                             $"&resultCode={payload.ResultCode}" +
                             $"&transId={payload.TransId}";
            
            string receivedSignature = payload.Signature;
            string calculatedSignature = SecurityHelper.CreateHmacSha256(rawHash, _momoSettings.SecretKey);

            if (receivedSignature != calculatedSignature)
            {
                throw new InvalidOperationException("Chữ ký MoMo không hợp lệ.");
            }
            
            // 2. Chữ ký hợp lệ -> Xử lý nghiệp vụ
            if (payload.ResultCode == 0) // 0 = Thành công
            {
                // Parse OrderId (vì lúc tạo ta đã thêm Guid)
                int orderId;
                try
                {
                    orderId = int.Parse(payload.OrderId.Split('_')[0]);
                }
                catch
                {
                    throw new InvalidDataException("Định dạng OrderId từ MoMo IPN không đúng.");
                }

                var order = await _context.RentalOrders
                    .FirstOrDefaultAsync(o => o.order_id == orderId);

                // 3. Kiểm tra tính toàn vẹn (Idempotency)
                // Đảm bảo chúng ta không xử lý 1 đơn hàng 2 lần (nếu MoMo gọi IPN nhiều lần)
                if (order != null && order.payment_status == "UNPAID")
                {
                    // a. Cập nhật RentalOrder
                    order.payment_status = "PAID";
                    
                    // b. TẠO RECORD PAYMENT (để đối soát)
                    var newPayment = new Payment
                    {
                        order_id = orderId,
                        amount = payload.Amount,
                        payment_method = "E-Wallet", //
                        payment_date = DateTime.UtcNow,
                        external_ref = payload.TransId.ToString() // Lưu mã GD của MoMo
                    };

                    _context.Payments.Add(newPayment);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                // Thanh toán thất bại, log lại
                // (Cậu có thể cập nhật status = "FAILED" nếu muốn)
            }
        }

        public async Task<IEnumerable<PaymentViewDto>> GetPaymentsForOrderAsync(int orderId)
        {
            // --- REFRACTOR 6: Dùng ProjectTo thay vì Select thủ công ---
            // AutoMapper sẽ tự động dịch LINQ Select hiệu quả
            return await _context.Payments
                .AsNoTracking()
                .Where(p => p.order_id == orderId)
                .ProjectTo<PaymentViewDto>(_mapper.ConfigurationProvider) // Dùng ProjectTo
                .ToListAsync();
        }

        // --- HÀM CHO THANH TOÁN TIỀN MẶT ---
        public async Task<PaymentViewDto> CreateCashPaymentAsync(CashPaymentCreateDto dto, int staffId)
        {
            // 1. Tìm đơn hàng
            var order = await _context.RentalOrders
                .FirstOrDefaultAsync(o => o.order_id == dto.OrderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng ID {dto.OrderId}");
            }

            // 2. Kiểm tra nghiệp vụ
            if (order.payment_status == "PAID")
            {
                throw new InvalidOperationException("Đơn hàng này đã được thanh toán.");
            }

            // 3. TẠO RECORD PAYMENT
            var newPayment = new Payment
            {
                order_id = order.order_id,
                amount = order.total_amount, // Lấy tổng tiền cuối cùng của đơn hàng
                payment_method = "Cash",     //
                payment_date = DateTime.UtcNow,
                external_ref = $"Confirmed by Staff ID: {staffId}" // Dùng để audit
            };

            // 4. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
            order.payment_status = "PAID";

            // 5. LƯU CẢ HAI THAY ĐỔI
            _context.Payments.Add(newPayment);
            await _context.SaveChangesAsync();
            
            // 6. Trả về PaymentViewDto (DÙNG AUTOMAPPER)
            return _mapper.Map<PaymentViewDto>(newPayment);
        }

        // --- TRIỂN KHAI HÀM VNPAY 1: TẠO THANH TOÁN ---
        public async Task<VnpayInitResponseDto> CreateVnpayPaymentRequestAsync(PaymentInitiationDto dto, int renterId, HttpContext httpContext)
        {
            // 1. Tìm Order và kiểm tra (Giữ nguyên)
            var order = await _context.RentalOrders
                .FirstOrDefaultAsync(o => o.order_id == dto.OrderId);

            if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn hàng.");
            if (order.renter_id != renterId) throw new UnauthorizedAccessException("Bạn không có quyền thanh toán.");
            if (order.payment_status == "PAID") throw new InvalidOperationException("Đơn hàng đã thanh toán.");

            // 2. LOGIC IP (GÁN CỨNG IP THẬT CỦA CẬU ĐÃ WHITELIST)
            var ipAddress = "118.69.182.149"; // <-- IP CỦA CẬU

            // 3. Chuẩn bị dữ liệu
            // (Áp dụng feedback 2 - an toàn hơn)
            long vnpAmount = Convert.ToInt64(Math.Round(order.deposit_amount * 100M));
            // (Feedback 2: Đổi vnp_TxnRef)
            string txnRef = $"{order.order_id}{DateTime.Now:yyyyMMddHHmmss}";

            var data = new SortedDictionary<string, string>(StringComparer.Ordinal)
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", _vnpaySettings.TmnCode },
                { "vnp_Amount", vnpAmount.ToString() },
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", ipAddress },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", $"Thanh toan don hang {order.order_id}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", _vnpaySettings.ReturnUrl },
                // (Áp dụng feedback 6)
                { "vnp_TxnRef", txnRef }
            };

            // --- BƯỚC 4 & 5: SỬA LẠI THEO LOGIC CỦA VnPayLibrary.cs ---

            // 4.1. Tạo chuỗi ký (signData) VÀ chuỗi URL (queryString)
            // (Giống hệt logic của CreateRequestUrl)
            var dataBuilder = new StringBuilder();
            foreach (var kv in data)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    // Encode CẢ Key VÀ Value
                    dataBuilder.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
            }
            
            string queryString = dataBuilder.ToString();

            // 4.2. Lấy chuỗi signData (bằng cách xóa dấu '&' cuối)
            string signData = queryString;
            if (signData.Length > 0)
            {
                signData = signData.Remove(signData.Length - 1, 1);
            }
            
            // 4.3. Hash chuỗi signData (Dùng logic HmacSHA512 của SecurityHelper)
            // (Hàm HmacSHA512 của chúng ta và của Demo là tương đương)
            string vnpSecureHash = SecurityHelper.CreateVnpayHmacSha512(signData, _vnpaySettings.HashSecret);
            
            // 5. Tạo URL cuối cùng
            // (Nối cái queryString (vẫn còn dấu & cuối) với vnp_SecureHash)
            //
            string paymentUrl = _vnpaySettings.Url + "?" + queryString + "vnp_SecureHash=" + vnpSecureHash;

            return new VnpayInitResponseDto { PaymentUrl = paymentUrl };
        }

        // --- TRIỂN KHAI HÀM VNPAY 2: XỬ LÝ IPN ---
        public async Task<string> ProcessVnpayIpnAsync(VnpayIpnDto ipnDto)
        {
            // 1. Chuyển DTO thành Dictionary để kiểm tra chữ ký
            var queryParams = new Dictionary<string, string>();
            foreach (var prop in ipnDto.GetType().GetProperties())
            {
                var value = prop.GetValue(ipnDto)?.ToString();
                if (!string.IsNullOrEmpty(value))
                {
                    queryParams.Add(prop.Name, value);
                }
            }

            // 2. KIỂM TRA CHỮ KÝ
            bool isValidSignature = SecurityHelper.ValidateVnpaySignature(queryParams, _vnpaySettings.HashSecret);
            if (!isValidSignature)
            {
                // Trả về mã lỗi cho VNPay (để họ không gửi lại)
                return "{\"RspCode\":\"97\", \"Message\":\"Invalid Checksum\"}";
            }
            
            // 3. Chữ ký hợp lệ -> Xử lý nghiệp vụ
            if (ipnDto.vnp_ResponseCode == "00") // 00 = Thành công
            {
                int orderId;
                try
                {
                    orderId = int.Parse(ipnDto.vnp_TxnRef.Split('_')[0]); // Lấy OrderId
                }
                catch
                {
                    return "{\"RspCode\":\"01\", \"Message\":\"Order not found\"}";
                }

                var order = await _context.RentalOrders.FirstOrDefaultAsync(o => o.order_id == orderId);

                // 4. Kiểm tra (Idempotency)
                if (order == null)
                    return "{\"RspCode\":\"01\", \"Message\":\"Order not found\"}";
                
                if (order.payment_status == "PAID")
                    return "{\"RspCode\":\"02\", \"Message\":\"Order already paid\"}";
                
                // 5. Cập nhật DB
                order.payment_status = "PAID";
                var newPayment = new Payment
                {
                    order_id = orderId,
                    amount = ipnDto.vnp_Amount / 100, // Nhớ chia 100
                    payment_method = "E-Wallet",
                    payment_date = DateTime.UtcNow,
                    external_ref = ipnDto.vnp_TransactionNo.ToString()
                };

                _context.Payments.Add(newPayment);
                await _context.SaveChangesAsync();
                
                // 6. Trả về 00 cho VNPay
                return "{\"RspCode\":\"00\", \"Message\":\"Confirm Success\"}";
            }
            
            // (Nếu thanh toán thất bại, không cần làm gì DB, 
            // nhưng vẫn báo 00 để VNPay không gửi lại)
            return "{\"RspCode\":\"00\", \"Message\":\"Confirm Success\"}";
        }
    }
}