using BusinessLogicLayer.Helpers.CurrentUserAccessor;
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
        private readonly ICurrentUserAccessor _currentUser;

        public ContractsService(ApplicationDbContext context, IMapper mapper, ICurrentUserAccessor currentUser)
        {
            _context = context;
            _mapper = mapper;
            _currentUser = currentUser;
        }
        // Implement các phương thức của IContractsService ở đây

        // --- Nghiệp vụ chính: Tạo Hợp đồng ---
        public async Task<ContractViewDto> CreateContractAsync(ContractCreateDto createDto)
        {
            // === LOGIC MỚI: LẤY STAFF ID TỪ HELPER ===
            var staffId = _currentUser.StaffId;
            if (staffId == null)
            {
                throw new UnauthorizedAccessException("Bạn phải là nhân viên mới được tạo hợp đồng.");
            }

            // 1. Validation: Kiểm tra RentalOrder
            var order = await _context.RentalOrders
                .Include(o => o.vehicle)
                .FirstOrDefaultAsync(o => o.order_id == createDto.OrderId);

            if (order == null)
            {
                throw new KeyNotFoundException("RentalOrder không tồn tại.");
            }

            // 2. Validation: Kiểm tra trạng thái Order
            // Chỉ tạo hợp đồng khi đơn ở trạng thái "APPROVED"
            if (order.status != "APPROVED") 
            {
                throw new InvalidOperationException($"Không thể tạo hợp đồng cho đơn hàng ở trạng thái {order.status}.");
            }

            // 3. Validation: Kiểm tra Hợp đồng trùng lặp
            // Bảng Contract có ràng buộc UNIQUE 1-1 với order_id 
            var contractExists = await _context.Contracts
                .AnyAsync(c => c.order_id == createDto.OrderId);

            if (contractExists)
            {
                throw new InvalidOperationException("Đơn hàng này đã có hợp đồng.");
            }

            // 4. Validation: Kiểm tra Staff ID (dù FK đã ràng buộc)
            var staffExists = await _context.Staff.AnyAsync(s => s.staff_id == staffId);
            if (!staffExists)
            {
                throw new KeyNotFoundException("Nhân viên không tồn tại.");
            }

            // 5. Tạo mới Contract
            var newContract = new Contract
            {
                order_id = createDto.OrderId,
                staff_id = staffId.Value
                // signed_date sẽ được SQL tự động gán giá trị default [cite: 31]
            };

            _context.Contracts.Add(newContract);

            // 6. Cập nhật trạng thái RentalOrder
            
            // Khi ký hợp đồng, đơn hàng chuyển sang "IN_USE" [cite: 29]
            order.status = "IN_USE";

            // === THÊM DÒNG NÀY (LOGIC MỚI TỪ CSDL) ===
            order.pickup_staff_id = staffId.Value; // Ghi nhận Staff đã giao xe
            if (order.vehicle != null)
            {
                order.vehicle.is_available = false; // Khóa xe lại
            }
            else
            {
                // Điều này không nên xảy ra nếu DB toàn vẹn, nhưng nên log lại
                throw new InvalidDataException($"Không tìm thấy Vehicle liên kết với Order ID {order.order_id}");
            }

            // 7. Lưu thay đổi
            await _context.SaveChangesAsync();

            // 8. Lấy dữ liệu đầy đủ và trả về DTO
            // Gọi hàm GetByIdAsync để tái sử dụng logic query
            var resultDto = await GetContractByIdAsync(newContract.contract_id);

            if (resultDto == null)
            {
                // Trường hợp này gần như không thể xảy ra
                throw new Exception("Lỗi nghiêm trọng: Không thể truy xuất hợp đồng vừa tạo.");
            }

            return resultDto;
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