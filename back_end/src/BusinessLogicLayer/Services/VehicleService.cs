using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogicLayer.DTOs.Vehicles;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public VehicleService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // 1. CREATE
        public async Task<VehicleViewDto> CreateAsync(VehicleCreateDto dto)
        {
            // Rule 1: Check unique license plate
            var normalizedPlate = dto.LicensePlate.Trim().ToLower();
            if (await _context.Vehicles.AnyAsync(v => v.license_plate.ToLower() == normalizedPlate))
            {
                throw new InvalidOperationException("License plate already exists.");
            }

            // Rule 2: Check FKs
            if (!await _context.Vehicle_Models.AnyAsync(m => m.vehicle_model_id == dto.VehicleModelId))
            {
                throw new InvalidOperationException("Vehicle Model ID does not exist.");
            }
            if (!await _context.Stations.AnyAsync(s => s.station_id == dto.StationId))
            {
                throw new InvalidOperationException("Station ID does not exist.");
            }

            var entity = _mapper.Map<Vehicle>(dto);
            entity.license_plate = dto.LicensePlate.Trim(); // Giữ case gốc hoặc Upper()
            
            // Rule 3 (Enum) và Rule 5 (Logic)
            if (entity.condition == "IN_REPAIR" || entity.condition == "DAMAGED")
            {
                entity.is_available = false;
            }
            else
            {
                entity.condition = "GOOD";
                entity.is_available = true; // Xe mới mặc định là available
            }

            _context.Vehicles.Add(entity);
            await _context.SaveChangesAsync();
            
            // // Lấy lại dữ liệu đầy đủ (bao gồm Model và Station) để trả về
            var createdVehicleDto = await GetByIdAsync(entity.vehicle_id);
            return createdVehicleDto!;
            // return await GetByIdAsync(entity.vehicle_id)!;
        }

        // 2. DELETE
        public async Task<bool> DeleteAsync(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return false; // Not Found

            // Rule 4: Check RentalOrder
            if (await _context.RentalOrders.AnyAsync(o => o.vehicle_id == id))
            {
                return false; // Trả về false, Controller xử lý 409 Conflict
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
            return true;
        }

        // 3. GET BY ID
        public async Task<VehicleViewDto?> GetByIdAsync(int id)
        {
            // Dùng ProjectTo (AutoMapper) sẽ tự động xử lý các DTO lồng nhau
            return await _context.Vehicles
                .Where(v => v.vehicle_id == id)
                .ProjectTo<VehicleViewDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
        }

        // 4. GET PAGING/LIST
        public async Task<(IEnumerable<VehicleViewDto> data, int total)> GetPagedAsync(VehicleListQuery q)
        {
            var query = _context.Vehicles
                .Include(v => v.station) // Include để search
                .Include(v => v.vehicle_model) // Include để search
                .AsQueryable();

            // Filter
            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                query = query.Where(v => v.license_plate.Contains(q.Search)); //
            }
            if (q.StationId.HasValue)
            {
                query = query.Where(v => v.station_id == q.StationId.Value); //
            }
            if (q.VehicleModelId.HasValue)
            {
                query = query.Where(v => v.vehicle_model_id == q.VehicleModelId.Value); //
            }
            if (q.IsAvailable.HasValue)
            {
                query = query.Where(v => v.is_available == q.IsAvailable.Value); //
            }
            if (q.MinBattery.HasValue)
            {
                query = query.Where(v => v.vehicle_model.battery_capacity >= q.MinBattery.Value); //
            }

            // TODO: Sorting
            query = query.OrderBy(v => v.license_plate);

            var totalItems = await query.CountAsync();

            var data = await query
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ProjectTo<VehicleViewDto>(_mapper.ConfigurationProvider) // Dùng AutoMapper
                .ToListAsync();

            return (data, totalItems);
        }

        // 5. UPDATE LOCATION (Admin)
        public async Task<bool> UpdateLocationAsync(int id, VehicleLocationUpdateDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return false; // Not Found
            
            // Rule 2: Check FK
            if (vehicle.station_id != dto.StationId && // Chỉ check nếu StationId thay đổi
                !await _context.Stations.AnyAsync(s => s.station_id == dto.StationId))
            {
                throw new InvalidOperationException("New Station ID does not exist.");
            }

            // Chỉ cập nhật location
            vehicle.station_id = dto.StationId;
            
            await _context.SaveChangesAsync();
            return true;
        }

        // 6. UPDATE STATUS (Staff)
        public async Task<bool> UpdateStatusAsync(int id, VehicleStatusUpdateDto dto)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return false; // Not Found

            // Map các trường từ DTO (Condition, IsAvailable, Battery, Mileage)
            _mapper.Map(dto, vehicle);
            
            // Rule 5 (Logic): Nếu Staff báo hỏng, tự động set "Không có sẵn"
            if (vehicle.condition == "IN_REPAIR" || vehicle.condition == "DAMAGED")
            {
                vehicle.is_available = false; // Ghi đè, đảm bảo an toàn
            }
            // Rule 5 (Logic ngược): Nếu Staff set 'GOOD' nhưng quên set 'Available'
            else if (vehicle.condition == "GOOD" && dto.IsAvailable == true) 
            {
                 vehicle.is_available = true; // Cho phép set available nếu là 'GOOD'
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}