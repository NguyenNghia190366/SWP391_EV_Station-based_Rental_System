using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment.VNPAY
{
    public class VnpayIpnDto
    {
        public string vnp_TmnCode { get; set; } = string.Empty;
        public long vnp_Amount { get; set; }
        public string vnp_BankCode { get; set; } = string.Empty;
        public string vnp_BankTranNo { get; set; } = string.Empty;
        public string vnp_CardType { get; set; } = string.Empty;
        public string vnp_PayDate { get; set; } = string.Empty;
        public string vnp_OrderInfo { get; set; } = string.Empty;
        public long vnp_TransactionNo { get; set; }
        public string vnp_ResponseCode { get; set; } = string.Empty;
        public string vnp_TransactionStatus { get; set; } = string.Empty;
        public string vnp_TxnRef { get; set; } = string.Empty; // Đây là OrderId của mình
        public string vnp_SecureHash { get; set; } = string.Empty; // Chữ ký
    }
}