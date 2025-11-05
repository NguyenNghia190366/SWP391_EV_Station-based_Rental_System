using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.DTOs.Payment.VNPAY;
using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.Interfaces
{
    public interface IPaymentsService
    {
        // --- HÀM CHO THANH TOÁN TIỀN MẶT ---
        Task<PaymentViewDto> CreateCashPaymentAsync(CashPaymentCreateDto dto, int staffId);

        
        // --- HÀM CHO THANH TOÁN MoMo ---
        // Renter gọi để lấy link thanh toán
        Task<PaymentInitResponseDto> CreateMoMoPaymentRequestAsync(PaymentInitiationDto dto, int renterId);
        // MoMo gọi (IPN) để báo kết quả
        Task ProcessMomoIpnAsync(MomoIpnDto payload);

        // --- HÀM CHO THANH TOÁN VNPay ---
        // Cần HttpContext để lấy IP của Renter
        Task<VnpayInitResponseDto> CreateVnpayPaymentRequestAsync(PaymentInitiationDto dto, int renterId, HttpContext httpContext); 
        // Trả về string (thay vì Task) vì VNPay yêu cầu response đặc biệt
        Task<string> ProcessVnpayIpnAsync(VnpayIpnDto ipnDto);

        // Renter/Staff xem lịch sử thanh toán
        Task<IEnumerable<PaymentViewDto>> GetPaymentsForOrderAsync(int orderId);

    }
}