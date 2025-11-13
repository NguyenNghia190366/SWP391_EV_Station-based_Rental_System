using AutoMapper;
using AutoMapper.QueryableExtensions; // Cần cho ProjectTo (nếu dùng)
using BusinessLogicLayer.DTOs.Staff;
using BusinessLogicLayer.Interfaces;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class StaffService : IStaffService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public StaffService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // 1. HÀM MỚI DÙNG IEnumerable
        public async Task<IEnumerable<StaffViewDto>> GetAllStaffAsync()
        {
            // Lấy dữ liệu Staff, join với User và Station
            var allStaff = await _context.Staff
                .Include(s => s.user)     // Lấy thông tin user
                .Include(s => s.station)  // Lấy thông tin trạm
                .AsNoTracking()
                .ToListAsync();
            
            // Map danh sách Entities sang danh sách DTOs
            return _mapper.Map<IEnumerable<StaffViewDto>>(allStaff);

        }

        // 2. HÀM CŨ (Assign) ĐÃ REFACTOR
        public async Task<StaffViewDto> AssignStaffToStationAsync(int staffId, StaffAssignStationDto dto)
        {
            // 1. Kiểm tra xem Station (Trạm) có tồn tại không
            var station = await _context.Stations.FindAsync(dto.StationId);
            if (station == null)
            {
                // Ném lỗi 404
                throw new KeyNotFoundException($"Không tìm thấy trạm (Station) với ID: {dto.StationId}");
            }

            // 2. Tìm Staff (Nhân viên)
            var staff = await _context.Staff
                .Include(s => s.user) // Include User để map DTO trả về
                .FirstOrDefaultAsync(s => s.staff_id == staffId);

            if (staff == null)
            {
                // Ném lỗi 404
                throw new KeyNotFoundException($"Không tìm thấy nhân viên (Staff) với ID: {staffId}");
            }

            // 3. Thực hiện gán
            staff.station_id = dto.StationId;

            // 4. Lưu thay đổi
            // Dùng try-catch ở đây để bắt lỗi CSDL (nếu có)
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Nếu có lỗi CSDL, ném lỗi 500
                throw new Exception($"Lỗi khi cập nhật cơ sở dữ liệu: {ex.Message}");
            }

            // 5. Map sang DTO để trả về
            // Gán lại đối tượng station để mapper có dữ liệu mới nhất
            staff.station = station; 
            return _mapper.Map<StaffViewDto>(staff);
        }
    }
}