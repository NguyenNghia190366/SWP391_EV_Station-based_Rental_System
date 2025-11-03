using System.Net.Http.Json;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.Helpers;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BusinessLogicLayer.Services
{
    public class PaymentsService : IPaymentsService
    {
        private readonly ApplicationDbContext _context;
        private readonly MomoSettings _momoSettings;
        private readonly IMapper _mapper;
        private readonly IHttpClientFactory _httpClientFactory;

        public PaymentsService(ApplicationDbContext context, 
                               IOptions<MomoSettings> momoSettings,
                               IHttpClientFactory httpClientFactory,
                               IMapper mapper)
        {
            _context = context;
            _momoSettings = momoSettings.Value;
            _httpClientFactory = httpClientFactory;
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


    }
}