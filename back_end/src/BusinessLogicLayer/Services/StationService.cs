// BusinessLogicLayer/Services/StationService.cs
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.Station;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    // Service implementing station-related business logic.
    // Được đăng ký với DI container (AddScoped) và được sử dụng bởi controllers.
    public class StationService : IStationService
    {
        // EF Core DbContext injected via constructor (dependency injection).
        private readonly ApplicationDbContext _db;
        public StationService(ApplicationDbContext db) => _db = db;

        // Lấy danh sách có phân trang + tìm kiếm
        // Trả về tuple: (dữ liệu dạng DTO, tổng số bản ghi phù hợp)
        public async Task<(IEnumerable<StationViewDto> data, int total)> GetPagedAsync(int page, int pageSize, string? search)
        {
            // Bắt đầu từ DbSet Stations; AsNoTracking để tối ưu khi chỉ đọc (không sửa đổi entity).
            var q = _db.Stations.AsNoTracking();

            // Nếu có từ khoá tìm kiếm, filter theo tên hoặc địa chỉ (contains).
            if (!string.IsNullOrWhiteSpace(search))
            {
                q = q.Where(s =>
                    (s.station_name ?? "").Contains(search) ||
                    (s.address ?? "").Contains(search));
            }

            // Tính tổng số bản ghi phù hợp (trước khi phân trang).
            var total = await q.CountAsync();

            // Áp dụng sắp xếp, phân trang và chiếu sang DTO để trả về.
            var data = await q
                .OrderByDescending(s => s.station_id)               // sắp xếp mới nhất trước
                .Skip((page - 1) * pageSize)                                      // bỏ qua các trang trước
                .Take(pageSize)                                                 // lấy pageSize phần tử
                .Select(s => new StationViewDto                    // map entity -> DTO
                {
                    StationId   = s.station_id,
                    StationName = s.station_name ?? "",           // phòng tránh null
                    Address     = s.address ?? "",
                    // latitude/longitude ở DB là decimal? có thể null -> convert sang double? nullable
                    Latitude    = s.latitude  == null ? null : (double?)s.latitude,
                    Longitude   = s.longitude == null ? null : (double?)s.longitude,
                    Status      = s.status ?? "ACTIVE",           // fallback nếu null
                    Capacity    = s.capacity
                })
                .ToListAsync();

            return (data, total);
        }

        // Lấy chi tiết 1 station theo id, trả về DTO hoặc null nếu không tồn tại.
        public async Task<StationViewDto?> GetByIdAsync(int id)
        {
            var s = await _db.Stations
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.station_id == id);

            if (s is null) return null;

            // Map entity -> DTO (giữ logic tương tự như GetPagedAsync)
            return new StationViewDto
            {
                StationId   = s.station_id,
                StationName = s.station_name ?? "",
                Address     = s.address ?? "",
                Latitude    = s.latitude  == null ? null : (double?)s.latitude,
                Longitude   = s.longitude == null ? null : (double?)s.longitude,
                Status      = s.status ?? "ACTIVE",
                Capacity    = s.capacity
            };
        }

        // Tạo mới station từ DTO, trả về id vừa tạo.
        public async Task<int> CreateAsync(StationCreateDto dto)
        {
            // Tạo entity từ DTO. Lưu ý conversion giữa double? (DTO) và decimal? (entity).
            var entity = new Station
            {
                station_name = dto.StationName,
                address      = dto.Address,
                latitude     = dto.Latitude  == null ? null : (decimal?)dto.Latitude,
                longitude    = dto.Longitude == null ? null : (decimal?)dto.Longitude,
                status       = dto.Status,                // 'ACTIVE' | 'INACTIVE'
                created_at   = DateTime.UtcNow,           // DB có default, gán thêm cũng ok
                capacity     = dto.Capacity
            };

            // Đánh dấu entity để thêm vào DB
            _db.Stations.Add(entity);
            // Persist thay đổi bất đồng bộ
            await _db.SaveChangesAsync();
            // Sau khi SaveChanges, EF sẽ điền giá trị PK (station_id) vào entity
            return entity.station_id;
        }

        // Cập nhật station theo id từ DTO. Trả về true nếu cập nhật thành công, false nếu không tìm thấy.
        public async Task<bool> UpdateAsync(int id, StationUpdateDto dto)
        {
            // FindAsync tìm theo PK; trả về tracked entity nếu tìm thấy.
            var entity = await _db.Stations.FindAsync(id);
            if (entity is null) return false;

            // Gán mới các trường (ghi đè). Nếu muốn partial update, cần check nulls dựa trên DTO thiết kế.
            entity.station_name = dto.StationName;
            entity.address      = dto.Address;
            entity.latitude     = dto.Latitude  == null ? null : (decimal?)dto.Latitude;
            entity.longitude    = dto.Longitude == null ? null : (decimal?)dto.Longitude;
            entity.status       = dto.Status;
            entity.capacity     = dto.Capacity;

            // Lưu thay đổi
            await _db.SaveChangesAsync();
            return true;
        }

        // Xoá station theo id. Trả về true nếu xoá thành công, false nếu không tìm thấy.
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Stations.FindAsync(id);
            if (entity is null) return false;

            // Hard delete: remove record khỏi DB.
            // Nếu muốn soft-delete, có thể set entity.status = "INACTIVE" và SaveChangesAsync()
            _db.Stations.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
