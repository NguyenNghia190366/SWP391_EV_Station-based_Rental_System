using BusinessLogicLayer.DTOs.Payment; // <-- Đã dùng DTOs mới
using BusinessLogicLayer.DTOs.Payment.VNPAY;
using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.Interfaces
{
    public interface IPaymentsService
    {
        // === HÀM MỚI CHO LOGIC "SỔ CÁI" ===

        /// <summary>
        /// (Staff) "Ghi nợ" - Thêm một khoản phí phát sinh (UNPAID) vào đơn hàng.
        /// </summary>
        Task<PaymentViewDto> AddChargeAsync(StaffAddChargeDto dto, int staffId);

        /// <summary>
        /// (Staff) Xác nhận thanh toán tiền mặt cho TẤT CẢ các khoản UNPAID của đơn hàng.
        /// </summary>
        Task<bool> ConfirmCashPaymentAsync(int orderId, int staffId);


        // --- HÀM CHO THANH TOÁN MoMo ---
        Task<PaymentInitResponseDto> CreateMoMoPaymentRequestAsync(PaymentInitiationDto dto, int renterId);
        Task ProcessMomoIpnAsync(MomoIpnDto payload);

        // --- HÀM CHO THANH TOÁN VNPay ---
        Task<VnpayInitResponseDto> CreateVnpayPaymentRequestAsync(PaymentInitiationDto dto, int renterId, HttpContext httpContext); 
        Task<string> ProcessVnpayIpnAsync(VnpayIpnDto ipnDto);

        // --- HÀM XEM "SỔ CÁI" ---
        Task<IEnumerable<PaymentViewDto>> GetPaymentsForOrderAsync(int orderId);
        // HÀM HOÀN CỌC
        Task CreateRefundRequestAsync(int orderId);
    }
}