// BusinessLogicLayer/Services/ExtraFeeTypeService.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.ExtraFeeType;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class ExtraFeeTypeService : IExtraFeeTypeService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ExtraFeeTypeService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ExtraFeeTypeViewDto> CreateAsync(ExtraFeeTypeCreateDto dto)
        {
            // 1. Kiểm tra logic: Tên không được trùng
            var normalizedName = dto.ExtraFeeTypeName.Trim().ToLower();
            var exists = await _context.ExtraFeeTypes
                .AnyAsync(f => f.extra_fee_type_name.ToLower() == normalizedName);
            
            if (exists)
            {
                throw new InvalidOperationException("Loại phí với tên này đã tồn tại.");
            }

            // 2. Dùng AutoMapper để map DTO sang Entity
            var newFeeType = _mapper.Map<ExtraFeeType>(dto);
            
            // (Đảm bảo tên đã được chuẩn hóa nếu cần)
            newFeeType.extra_fee_type_name = dto.ExtraFeeTypeName.Trim();

            // 3. Add và Save
            _context.ExtraFeeTypes.Add(newFeeType);
            await _context.SaveChangesAsync();

            // 4. Map Entity (đã có ID) sang View DTO để trả về
            return _mapper.Map<ExtraFeeTypeViewDto>(newFeeType);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var feeType = await _context.ExtraFeeTypes.FindAsync(id);
            if (feeType == null)
            {
                return false; // Không tìm thấy
            }

            // Logic CSDL của cậu là "snapshot" (lưu tên và giá vào Payment)
            // nên chúng ta có thể xóa ExtraFeeType một cách an toàn.
            // Nó sẽ không ảnh hưởng đến các record Payment cũ,
            // chỉ là Staff không thể chọn nó cho các khoản phí mới nữa.
            
            _context.ExtraFeeTypes.Remove(feeType);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ExtraFeeTypeViewDto>> GetAllAsync()
        {
            // Dùng AsNoTracking() vì đây là dữ liệu chỉ đọc
            // Dùng ProjectTo để map hiệu quả sang DTO
            return await _context.ExtraFeeTypes
                .AsNoTracking()
                .OrderBy(f => f.extra_fee_type_name)
                .ProjectTo<ExtraFeeTypeViewDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<ExtraFeeTypeViewDto?> GetByIdAsync(int id)
        {
            return await _context.ExtraFeeTypes
                .AsNoTracking()
                .Where(f => f.extra_fee_type_id == id)
                .ProjectTo<ExtraFeeTypeViewDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, ExtraFeeTypeUpdateDto dto)
        {
            var feeType = await _context.ExtraFeeTypes.FindAsync(id);
            if (feeType == null)
            {
                return false; // Không tìm thấy
            }

            // Kiểm tra tên trùng (loại trừ chính nó)
            var normalizedName = dto.ExtraFeeTypeName.Trim().ToLower();
            var exists = await _context.ExtraFeeTypes
                .AnyAsync(f => f.extra_fee_type_name.ToLower() == normalizedName && f.extra_fee_type_id != id);

            if (exists)
            {
                throw new InvalidOperationException("Một loại phí khác với tên này đã tồn tại.");
            }

            // Dùng AutoMapper để map DTO *đè* lên Entity
            _mapper.Map(dto, feeType);
            
            // Chuẩn hóa lại tên
            feeType.extra_fee_type_name = dto.ExtraFeeTypeName.Trim();

            await _context.SaveChangesAsync();
            return true;
        }
    }
}