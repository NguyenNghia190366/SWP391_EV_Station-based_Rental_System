using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Payment;

namespace BusinessLogicLayer.Interfaces
{
    public interface IPaymentsService
    {
        // Renter gọi để lấy link thanh toán
        Task<PaymentInitResponseDto> CreateMoMoPaymentRequestAsync(PaymentInitiationDto dto, int renterId);
        
        // MoMo gọi (IPN) để báo kết quả
        Task ProcessMomoIpnAsync(MomoIpnDto payload);

        // Renter/Staff xem lịch sử thanh toán
        Task<IEnumerable<PaymentViewDto>> GetPaymentsForOrderAsync(int orderId);

        // --- HÀM CHO THANH TOÁN TIỀN MẶT ---
        Task<PaymentViewDto> CreateCashPaymentAsync(CashPaymentCreateDto dto, int staffId);
    }
}