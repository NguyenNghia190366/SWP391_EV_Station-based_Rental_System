using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class MomoIpnDto
    {
        public string PartnerCode { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty; // ID đơn hàng *của cậu*
        public string RequestId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public string OrderType { get; set; } = string.Empty;
        public long TransId { get; set; } // Mã giao dịch của MoMo
        public int ResultCode { get; set; } // 0 = thành công
        public string Message { get; set; } = string.Empty;
        public string PayType { get; set; } = string.Empty;
        public long ResponseTime { get; set; }
        public string ExtraData { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty; // Chữ ký (cực kỳ quan trọng)
    }
}