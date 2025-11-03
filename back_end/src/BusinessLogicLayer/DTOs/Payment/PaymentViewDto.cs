using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class PaymentViewDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty; // "E-Wallet", "Cash" (bỏ "Card"  vì ko dùng)
        public DateTime PaymentDate { get; set; }
        public string ExternalRef { get; set; } = string.Empty; // Sẽ lưu MoMo's TransId
    }
}