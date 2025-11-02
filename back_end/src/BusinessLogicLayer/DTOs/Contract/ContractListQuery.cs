using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Contract
{
    public class ContractListQuery
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // --- Tùy chọn lọc (Filtering) ---
        
        // Lọc theo Renter (Admin xem)
        public int? RenterId { get; set; } 

        // Lọc theo Staff (Admin xem)
        public int? StaffId { get; set; }

        // Lọc theo Trạm (Admin/Staff xem)
        public int? StationId { get; set; } // Lọc theo trạm ký (pickup_station_id từ Order)

        // Lọc theo ngày ký
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        // Sắp xếp
        public string SortBy { get; set; } = "signed_date"; // Mặc định
        public bool IsAscending { get; set; } = false; // Mặc định mới nhất
    }
}