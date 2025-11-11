using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Contract;

namespace BusinessLogicLayer.Interfaces
{
    public interface IContractsService
    {
        // Nghiệp vụ chính: Staff tạo hợp đồng khi check-in cho khách
        // Cần truyền vào staffId (lấy từ User.Claims context) và DTO
        Task<ContractViewDto> CreateContractAsync(ContractCreateDto createDto);

        // Lấy chi tiết 1 hợp đồng
        Task<ContractViewDto?> GetContractByIdAsync(int contractId);

        // Lấy danh sách hợp đồng (có lọc và phân trang)
        // (Chúng ta sẽ cần 1 DTO trả về chung cho PagingResult)
        Task<object> GetAllContractsAsync(ContractListQuery query);

        // Lấy danh sách hợp đồng của 1 Renter cụ thể (Renter xem lịch sử)
        Task<object> GetContractsByRenterAsync(int renterId, ContractListQuery query);

        // (Tùy chọn) Cập nhật URL của file PDF sau khi đã tạo
        Task<bool> UpdateContractPdfUrlAsync(int contractId, string pdfUrl);
    }
}