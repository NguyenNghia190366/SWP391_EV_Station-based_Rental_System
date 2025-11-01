using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.RentalOrder;

namespace BusinessLogicLayer.Interfaces
{
    public interface IRentalOrdersService
    {
       // Lấy danh sách (Cho Admin/Staff)
        Task<(IEnumerable<RentalOrderViewDto> data, int total)> GetPagedAsync(RentalOrderListQuery q);
        
        // Lấy danh sách đơn của Renter đang đăng nhập
        Task<(IEnumerable<RentalOrderViewDto> data, int total)> GetMyOrdersAsync(RentalOrderListQuery q);
        
        // Xem chi tiết (Chung)
        Task<RentalOrderViewDto?> GetByIdAsync(int id);
        
        // Renter tạo đơn (Tên hàm là CreateOrderAsync, 1 tham số)
        Task<RentalOrderViewDto> CreateOrderAsync(RentalOrderCreateDto dto);
        
        // Xử lý đơn (Staff/Renter) (Tên hàm là UpdateOrderStatusAsync, 2 tham số)
        Task<bool> UpdateOrderStatusAsync(int id, RentalOrderActionDto dto);
    }
}