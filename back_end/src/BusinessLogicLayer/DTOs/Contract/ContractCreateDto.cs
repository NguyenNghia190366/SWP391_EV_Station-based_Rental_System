using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Contract
{
    public class ContractCreateDto
    {
        public int OrderId { get; set; } 
        // public int StaffId { get; set; } // lấy từ User.Claims (context người dùng hiện tại)
    }
}