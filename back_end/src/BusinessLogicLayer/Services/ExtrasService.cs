using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.ExtraFee;
using BusinessLogicLayer.DTOs.FeeType;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class ExtrasService : IExtrasService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ExtrasService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        #region Quản lý FeeType (Admin)

        public async Task<IEnumerable<FeeTypeViewDto>> GetAllFeeTypesAsync()
        {
            // Dùng AsNoTracking() vì đây là dữ liệu chỉ đọc, giúp tăng hiệu suất
            return await _context.FeeTypes
                .AsNoTracking()
                .ProjectTo<FeeTypeViewDto>(_mapper.ConfigurationProvider) // Dùng ProjectTo
                .ToListAsync();
        }

        public async Task<FeeTypeViewDto> CreateFeeTypeAsync(FeeTypeCreateDto dto)
        {
            // 1. Kiểm tra logic (ví dụ: tên không trùng)
            var existing = await _context.FeeTypes
                .FirstOrDefaultAsync(f => f.FeeType1.ToLower() == dto.FeeType.ToLower());
            
            if (existing != null)
            {
                throw new InvalidOperationException("Loại phí với tên này đã tồn tại.");
            }

            // 2. Dùng AutoMapper để map DTO sang Entity
            var newFeeType = _mapper.Map<FeeType>(dto);

            // 3. Add và Save
            _context.FeeTypes.Add(newFeeType);
            await _context.SaveChangesAsync();

            // 4. Map Entity (đã có ID) sang View DTO để trả về
            return _mapper.Map<FeeTypeViewDto>(newFeeType);
        }

        public async Task UpdateFeeTypeAsync(int feeTypeId, FeeTypeUpdateDto dto)
        {
            var feeType = await _context.FeeTypes.FindAsync(feeTypeId);
            if (feeType == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy loại phí với ID {feeTypeId}");
            }

            // Dùng AutoMapper để map DTO *đè* lên Entity
            _mapper.Map(dto, feeType);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteFeeTypeAsync(int feeTypeId)
        {
            var feeType = await _context.FeeTypes.FindAsync(feeTypeId);
            if (feeType == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy loại phí với ID {feeTypeId}");
            }

            // **Quy tắc nghiệp vụ quan trọng**: Kiểm tra xem loại phí này đã
            // được gán vào bất kỳ ExtraFee nào chưa.
            var isUsed = await _context.ExtraFees
                .AnyAsync(ef => ef.FeeType_id == feeTypeId);
                
            if (isUsed)
            {
                throw new InvalidOperationException("Không thể xóa. Loại phí này đang được sử dụng trong một đơn hàng.");
            }

            _context.FeeTypes.Remove(feeType);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Quản lý ExtraFee (Staff/Renter)

        /// <summary>
        /// NGHIỆP VỤ QUAN TRỌNG: Thêm phí phát sinh vào Order
        /// </summary>
        public async Task<ExtraFeeViewDto> AddExtraFeeToOrderAsync(ExtraFeeCreateDto dto)
        {
            // 1. Tìm Order (phải tracking để update)
            var order = await _context.RentalOrders
                .FirstOrDefaultAsync(o => o.order_id == dto.OrderId);
            if (order == null)
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng ID {dto.OrderId}");

            // 2. Tìm FeeType (chỉ cần đọc)
            var feeType = await _context.FeeTypes
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FeeType_id == dto.FeeTypeId);
            if (feeType == null)
                throw new KeyNotFoundException($"Không tìm thấy loại phí ID {dto.FeeTypeId}");

            // 3. Kiểm tra quy tắc nghiệp vụ
            if (order.payment_status == "PAID")
            {
                throw new InvalidOperationException("Đơn hàng đã thanh toán, không thể thêm phí.");
            }

            // 4. Map DTO (ExtraFeeCreateDto) sang Entity (ExtraFee)
            var newExtraFee = _mapper.Map<ExtraFee>(dto);
            // created_at đã được set default trong SQL 

            // 5. *** LOGIC CỐT LÕI ***
            // Tự động cộng dồn số tiền của FeeType vào total_amount của RentalOrder
            order.total_amount += feeType.amount;

            // 6. Lưu cả 2 thay đổi (thêm ExtraFee VÀ cập nhật RentalOrder)
            // SaveChangesAsync sẽ thực hiện việc này trong một transaction
            _context.ExtraFees.Add(newExtraFee);
            await _context.SaveChangesAsync();

            // 7. Trả về View DTO
            // Vì ExtraFeeViewDto cần thông tin (Tên, Số tiền) từ FeeType, 
            // chúng ta nên tạo DTO thủ công ở đây để đảm bảo chính xác.
            return new ExtraFeeViewDto
            {
                FeeId = newExtraFee.fee_id,
                OrderId = newExtraFee.order_id,
                FeeType = feeType.FeeType1,  // Lấy từ FeeType
                Amount = feeType.amount,    // Lấy từ FeeType
                Description = newExtraFee.description ?? string.Empty,
                CreatedAt = newExtraFee.created_at
            };
        }

        /// <summary>
        /// NGHIỆP VỤ QUAN TRỌNG: Xóa phí phát sinh (nếu thêm nhầm)
        /// </summary>
        public async Task DeleteExtraFeeAsync(int feeId)
        {
            // 1. Tìm ExtraFee, *phải* Include FeeType để biết số tiền cần trừ
            var extraFee = await _context.ExtraFees
                .Include(ef => ef.FeeType) 
                .FirstOrDefaultAsync(ef => ef.fee_id == feeId);
            
            if (extraFee == null)
                throw new KeyNotFoundException($"Không tìm thấy phí phát sinh ID {feeId}");
            
            // (Kiểm tra phòng hờ)
            if (extraFee.FeeType == null)
                throw new InvalidDataException("Dữ liệu lỗi: Phí này không liên kết với Loại phí nào.");

            // 2. Tìm Order (phải tracking)
            var order = await _context.RentalOrders
                .FirstOrDefaultAsync(o => o.order_id == extraFee.order_id);
            if (order == null)
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng ID {extraFee.order_id}");

            // 3. Kiểm tra quy tắc nghiệp vụ
            if (order.payment_status == "PAID")
            {
                throw new InvalidOperationException("Đơn hàng đã thanh toán, không thể xóa phí.");
            }

            // 4. *** LOGIC CỐT LÕI ***
            // Tự động trừ số tiền của FeeType ra khỏi total_amount của RentalOrder
            order.total_amount -= extraFee.FeeType.amount;
            
            // Đảm bảo total_amount không bị âm
            if (order.total_amount < 0)
            {
                order.total_amount = 0; // (Hoặc bằng tiền cọc, tùy logic)
            }

            // 5. Lưu cả 2 thay đổi (xóa ExtraFee VÀ cập nhật RentalOrder)
            _context.ExtraFees.Remove(extraFee);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ExtraFeeViewDto>> GetExtraFeesForOrderAsync(int orderId)
        {
            // Kiểm tra Order có tồn tại không
            var orderExists = await _context.RentalOrders.AnyAsync(o => o.order_id == orderId);
            if (!orderExists)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng ID {orderId}");
            }
            
            // Cách tốt nhất để map View DTO có Join là dùng 'Select' (hoặc 'ProjectTo')
            var fees = await _context.ExtraFees
                .AsNoTracking()
                .Where(ef => ef.order_id == orderId)
                .Include(ef => ef.FeeType) // Join với bảng FeeType
                .Select(ef => new ExtraFeeViewDto
                {
                    FeeId = ef.fee_id,
                    OrderId = ef.order_id,
                    FeeType = ef.FeeType.FeeType1, // Lấy tên từ FeeType
                    Amount = ef.FeeType.amount,   // Lấy số tiền từ FeeType
                    Description = ef.description ?? string.Empty,
                    CreatedAt = ef.created_at
                })
                .ToListAsync();
            
            return fees;
        }

        #endregion

    }
}