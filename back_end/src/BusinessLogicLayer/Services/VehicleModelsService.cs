using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.VehicleModels;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models; // Đảm bảo import Models
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class VehicleModelsService : IVehicleModelsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public VehicleModelsService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // Tạo một VehicleModel
        public async Task<VehicleModelViewDto> CreateAsync(VehicleModelCreateDto dto)
        {   
            // Rule 1.5: Normalize text 
            var normalizedBrand = dto.BrandName.Trim();
            var normalizedModel = dto.ModelName.Trim();

            // Rule 1.5: Unique (Brand + ModelName) (đảm bảo unique brand + model)
            var exists = await _context.Vehicle_Models.AnyAsync(vm => 
                vm.brand_name.ToLower() == normalizedBrand.ToLower() &&
                vm.model_name.ToLower() == normalizedModel.ToLower() // <-- Check cả model_name
            );
            
            if (exists)
            {
                throw new InvalidOperationException("Mẫu xe với thương hiệu và tên mẫu này đã tồn tại.");
            }

            var entity = _mapper.Map<Vehicle_Model>(dto);
            
            // Gán giá trị đã chuẩn hóa
            entity.brand_name = normalizedBrand;
            entity.model_name = normalizedModel; // <-- Gán model_name

            _context.Vehicle_Models.Add(entity);
            await _context.SaveChangesAsync();

            // Map lại sang ViewDto để trả về (đã bao gồm ID)
            return _mapper.Map<VehicleModelViewDto>(entity);
        }

        

        public async Task<VehicleModelViewDto?> GetByIdAsync(int id)
        {
            // Cần cấu hình AutoMapper để map Vehicle_Model -> VehicleModelViewDto
            // và tính VehiclesCount
            return await _context.Vehicle_Models
                .Where(vm => vm.vehicle_model_id == id)
                .ProjectTo<VehicleModelViewDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
        }

        public async Task<(IEnumerable<VehicleModelViewDto> data, int total)> GetPagedAsync(VehicleModelListQuery q)
        {
            var query = _context.Vehicle_Models.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                var searchTerm = q.Search.Trim().ToLower();
                query = query.Where(vm => 
                    vm.brand_name.ToLower().Contains(searchTerm) ||
                    vm.model_name.ToLower().Contains(searchTerm) // <-- Search cả model_name
                );
            }

            query = query.OrderBy(vm => vm.brand_name).ThenBy(vm => vm.model_name); // TODO: Implement dynamic sort

            var totalItems = await query.CountAsync();

            var data = await query
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ProjectTo<VehicleModelViewDto>(_mapper.ConfigurationProvider) 
                .ToListAsync();

            return (data, totalItems);
        }

        public async Task<bool> UpdateAsync(int id, VehicleModelUpdateDto dto)
        {
            var entity = await _context.Vehicle_Models.FindAsync(id);
            if (entity == null)
            {
                return false; // Not Found
            }

            // Check unique (Brand + Model) nếu nó thay đổi
            var normalizedBrand = dto.BrandName.Trim();
            var normalizedModel = dto.ModelName.Trim();

            if (entity.brand_name.ToLower() != normalizedBrand.ToLower() ||
                entity.model_name.ToLower() != normalizedModel.ToLower())
            {
                var exists = await _context.Vehicle_Models.AnyAsync(vm =>
                    vm.brand_name.ToLower() == normalizedBrand.ToLower() &&
                    vm.model_name.ToLower() == normalizedModel.ToLower() &&
                    vm.vehicle_model_id != id // <-- Loại trừ chính nó
                );

                if (exists)
                {
                    throw new InvalidOperationException("Đã tồn tại mẫu xe khác với cùng thương hiệu và tên mẫu.");
                }
            }

            // Map DTO (Update) vào Entity (đã lấy từ DB)
            _mapper.Map(dto, entity);

            // Ghi đè các giá trị đã chuẩn hóa
            entity.brand_name = normalizedBrand;
            entity.model_name = normalizedModel;

            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> DeleteAsync(int id)
        {
            var model = await _context.Vehicle_Models.FindAsync(id);
            if (model == null)
            {
                return false; // Not Found
            }

            // Rule 1.5: Không xóa nếu có Vehicle đang dùng

            
            var hasVehicles = await _context.Vehicles
                .AnyAsync(v => v.vehicle_model_id == id);

            if (hasVehicles)
            {
                return false; 
            }

            _context.Vehicle_Models.Remove(model);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}