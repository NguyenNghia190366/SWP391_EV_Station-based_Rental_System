using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class PaymentInitResponseDto
    {
        public string PartnerCode { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty; // ID đơn hàng của mình
        public string RequestId { get; set; } = string.Empty; // ID request (do mình tạo)
        public long Amount { get; set; }
        public long ResponseTime { get; set; }
        public string Message { get; set; } = string.Empty;
        public int ResultCode { get; set; }
        public string PayUrl { get; set; } = string.Empty; // Quan trọng nhất: link QR
        public string DeepLink { get; set; } = string.Empty;
    }
}