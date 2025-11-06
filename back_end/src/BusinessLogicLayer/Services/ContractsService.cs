using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BusinessLogicLayer.DTOs.Contract;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class ContractsService : IContractsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public ContractsService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // Implement các phương thức của IContractsService ở đây

        // --- Nghiệp vụ chính: Tạo Hợp đồng ---
        public async Task<ContractViewDto> CreateContractAsync(ContractCreateDto createDto, int staffId)
        {
            // Bắt đầu một Transaction vì ta sẽ sửa 3 bảng
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Validation: Kiểm tra RentalOrder và Vehicle liên quan
                var order = await _context.RentalOrders
                    .Include(o => o.vehicle) // Phải Include Vehicle
                    .FirstOrDefaultAsync(o => o.order_id == createDto.OrderId);

                if (order == null)
                {
                    throw new KeyNotFoundException("RentalOrder không tồn tại.");
                }
                
                if (order.vehicle == null)
                {
                    // Cần thiết: Đơn hàng phải có xe mới giao được
                    throw new InvalidOperationException("Đơn hàng này chưa được gán xe (Vehicle).");
                }

                // 2. Validation: Kiểm tra trạng thái Order
                if (order.status != "BOOKED") 
                {
                    throw new InvalidOperationException($"Không thể tạo hợp đồng cho đơn hàng ở trạng thái {order.status}.");
                }

                // 3. Validation: Kiểm tra Hợp đồng trùng lặp
                var contractExists = await _context.Contracts
                    .AnyAsync(c => c.order_id == createDto.OrderId);

                if (contractExists)
                {
                    throw new InvalidOperationException("Đơn hàng này đã có hợp đồng.");
                }

                // 4. Validation: Kiểm tra Staff ID (Logic cũ của cậu, rất tốt)
                var staffExists = await _context.Staff.AnyAsync(s => s.staff_id == staffId);
                if (!staffExists)
                {
                    throw new KeyNotFoundException("Nhân viên không tồn tại.");
                }

                // 5. Tạo mới Contract
                var newContract = new Contract
                {
                    order_id = createDto.OrderId,
                    staff_id = staffId
                    // signed_date sẽ tự động gán default 
                };
                _context.Contracts.Add(newContract);

                // 6. Cập nhật RentalOrder
                order.status = "IN_USE"; // Chuyển trạng thái 
                order.img_vehicle_before_URL = createDto.ImgVehicleBeforeUrl; // Lưu ảnh 

                // 7. Cập nhật Vehicle
                order.vehicle.is_available = false; // Xe không còn sẵn có 

                // 8. Lưu tất cả thay đổi (Contract, Order, Vehicle)
                await _context.SaveChangesAsync();
                
                // 9. Hoàn tất Transaction
                await transaction.CommitAsync();

                // 10. Lấy dữ liệu đầy đủ và trả về DTO
                // Tái sử dụng logic của cậu, rất hay!
                var resultDto = await GetContractByIdAsync(newContract.contract_id);

                if (resultDto == null)
                {
                    throw new Exception("Lỗi nghiêm trọng: Không thể truy xuất hợp đồng vừa tạo.");
                }

                return resultDto;
            }
            catch (Exception)
            {
                // Nếu có bất kỳ lỗi nào, hủy bỏ tất cả thay đổi
                await transaction.RollbackAsync();
                throw; // Ném lỗi ra để Controller bắt
            }
        }

        // --- Lấy chi tiết 1 Hợp đồng ---
        public async Task<ContractViewDto?> GetContractByIdAsync(int contractId)
        {
            var contract = await GetFullContractQuery() // Tái sử dụng helper query
                .FirstOrDefaultAsync(c => c.contract_id == contractId);

            // AutoMapper sẽ lo việc map Contract -> ContractViewDto
            return _mapper.Map<ContractViewDto>(contract);
        }
        
        // --- Lấy danh sách (Admin/Staff) ---
        public async Task<object> GetAllContractsAsync(ContractListQuery query)
        {
            var queryable = GetFullContractQuery();

            // --- Lọc (Filtering) ---
            if (query.RenterId.HasValue)
                queryable = queryable.Where(c => c.order.renter_id == query.RenterId.Value);

            if (query.StaffId.HasValue)
                queryable = queryable.Where(c => c.staff_id == query.StaffId.Value);

            if (query.StationId.HasValue) // Lọc theo trạm nhận xe
                queryable = queryable.Where(c => c.order.pickup_station_id == query.StationId.Value);

            if (query.FromDate.HasValue)
                queryable = queryable.Where(c => c.signed_date.Date >= query.FromDate.Value.Date);
            
            if (query.ToDate.HasValue)
                queryable = queryable.Where(c => c.signed_date.Date <= query.ToDate.Value.Date);

            // (Có thể thêm logic Sắp xếp (Sorting) ở đây)
            queryable = queryable.OrderByDescending(c => c.signed_date);

            // --- Phân trang (Pagination) ---
            var totalItems = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<ContractViewDto>>(items);

            // Trả về một đối tượng PagingResult (tạm dùng anonymous)
            return new 
            {
                TotalItems = totalItems,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            };
        }

        // --- Lấy danh sách (Renter xem lịch sử) ---
        public async Task<object> GetContractsByRenterAsync(int renterId, ContractListQuery query)
        {
            var queryable = GetFullContractQuery()
                // --- Lọc bắt buộc ---
                .Where(c => c.order.renter_id == renterId);

            // --- Lọc tùy chọn (theo trạm, ngày) ---
            if (query.StationId.HasValue)
                queryable = queryable.Where(c => c.order.pickup_station_id == query.StationId.Value);

            if (query.FromDate.HasValue)
                queryable = queryable.Where(c => c.signed_date.Date >= query.FromDate.Value.Date);
            
            if (query.ToDate.HasValue)
                queryable = queryable.Where(c => c.signed_date.Date <= query.ToDate.Value.Date);
            
            queryable = queryable.OrderByDescending(c => c.signed_date);

            // --- Phân trang ---
            var totalItems = await queryable.CountAsync();
            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<ContractViewDto>>(items);

            return new 
            {
                TotalItems = totalItems,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                Items = dtos
            };
        }

        // --- Cập nhật URL file PDF (sau khi upload) ---
        public async Task<bool> UpdateContractPdfUrlAsync(int contractId, string pdfUrl)
        {
            var contract = await _context.Contracts.FindAsync(contractId);
            if (contract == null)
            {
                return false;
            }

            contract.contract_pdf_url = pdfUrl;
            await _context.SaveChangesAsync();
            return true;
        }

        // --- Private Helper: Hàm query chung ---
        // Tái sử dụng logic Include (nạp dữ liệu)
        private IQueryable<Contract> GetFullContractQuery()
        {
            return _context.Contracts
                .AsNoTracking() // Dùng cho các truy vấn CHỈ ĐỌC (READ-ONLY)
                
                // StaffInfo
                .Include(c => c.staff)
                    .ThenInclude(s => s.user) // Contract -> Staff -> User

                // OrderInfo (chính nó)
                .Include(c => c.order)
                
                // RenterInfo
                .Include(c => c.order)
                    .ThenInclude(o => o.renter)
                        .ThenInclude(r => r.user) // Contract -> Order -> Renter -> User
                
                // VehicleInfo
                .Include(c => c.order)
                    .ThenInclude(o => o.vehicle)
                        .ThenInclude(v => v.vehicle_model); // Contract -> Order -> Vehicle -> Vehicle_Model
        }









    }
}