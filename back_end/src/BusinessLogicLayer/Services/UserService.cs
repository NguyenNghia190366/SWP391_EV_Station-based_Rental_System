// BusinessLogicLayer/Services/UserService.cs
using BusinessLogicLayer.Interfaces;
using BusinessLogicLayer.DTOs.User;
using DataAccessLayer;
using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;
        public UserService(ApplicationDbContext db) => _db = db;

        /// <summary>
        /// Lấy danh sách người dùng có phân trang và bộ lọc.
        /// </summary>
        /// <param name="page">Số trang hiện tại.</param>
        /// <param name="pageSize">Số lượng mục trên mỗi trang.</param>
        /// <param name="role">Lọc theo vai trò (RENTER, STAFF, ADMIN).</param>
        /// <param name="status">Lọc theo trạng thái (Active, Inactive, Blocked).</param>
        /// <param name="keyword">Từ khóa tìm kiếm theo Tên, Email, hoặc Số điện thoại.</param>
        /// <returns>Một tuple chứa danh sách người dùng và tổng số lượng.</returns>
        public async Task<(IEnumerable<UserViewDto> data, int total)> GetPagedAsync(
            int page, int pageSize, string? role, string? status, string? keyword)
        {
            var query = _db.Users.AsNoTracking();

            // Áp dụng bộ lọc role
            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(u => u.role == role);

            // Áp dụng bộ lọc trạng thái
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(u => u.status == status);

            // Áp dụng bộ lọc tìm kiếm
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var keywordLower = keyword.ToLower();
                query = query.Where(u =>
                    u.full_name.ToLower().Contains(keywordLower) ||
                    u.email.ToLower().Contains(keywordLower) ||
                    (u.phone_number != null && u.phone_number.Contains(keyword))); // Sửa lại: Tìm kiếm trong các trường có thật
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(u => u.user_id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserViewDto // Sử dụng mapper ở đây sẽ tốt hơn
                {
                    UserId = u.user_id,
                    Email = u.email, // Sửa lại: Dùng Email thay cho Username
                    FullName = u.full_name,
                    PhoneNumber = u.phone_number,
                    Role = u.role,
                    Status = u.status
                })
                .ToListAsync();

            return (data, total);
        }

        /// <summary>
        /// Lấy thông tin chi tiết một người dùng bằng ID.
        /// </summary>
        /// <param name="id">ID của người dùng.</param>
        /// <returns>DTO chứa thông tin người dùng, hoặc null nếu không tìm thấy.</returns>
        public async Task<UserViewDto?> GetByIdAsync(int id)
        {
            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(x => x.user_id == id);

            if (user is null) return null;

            return new UserViewDto
            {
                UserId = user.user_id,
                Email = user.email, // Sửa lại: Dùng Email thay cho Username
                FullName = user.full_name,
                PhoneNumber = user.phone_number,
                Role = user.role,
                Status = user.status
            };
        }

        /// <summary>
        /// Tạo một người dùng mới.
        /// </summary>
        /// <param name="dto">DTO chứa thông tin để tạo người dùng.</param>
        /// <returns>ID của người dùng vừa tạo.</returns>
        public async Task<int> CreateAsync(UserCreateDto dto)
        {
            // TODO: Kiểm tra xem email đã tồn tại chưa
            // TODO: Hash mật khẩu trước khi lưu vào DB

            var entity = new User
            {
                full_name = dto.FullName,
                email = dto.Email, // Sửa lại: Dùng Email thay cho Username
                phone_number = dto.PhoneNumber,
                date_of_birth = dto.DateOfBirth,
                password_hash = dto.Password,
                role = dto.Role,     // "ADMIN" | "STAFF" | "RENTER"
                status = dto.Status  // "Active" | "Inactive"
            };

            _db.Users.Add(entity);
            await _db.SaveChangesAsync();
            return entity.user_id;
        }

        /// <summary>
        /// Cập nhật thông tin cơ bản của người dùng (thường do Admin thực hiện).
        /// </summary>
        /// <param name="id">ID của người dùng cần cập nhật.</param>
        /// <param name="dto">DTO chứa thông tin cần cập nhật.</param>
        /// <returns>True nếu thành công, False nếu không tìm thấy người dùng.</returns>
        public async Task<bool> UpdateAsync(int id, UserUpdateDto dto)
        {
            var entity = await _db.Users.FindAsync(id);
            if (entity is null) return false;

            // Chỉ cho phép cập nhật một số trường nhất định
            entity.full_name = dto.FullName;
            entity.phone_number = dto.PhoneNumber;
            entity.date_of_birth = dto.DateOfBirth;
            entity.role = dto.Role;
            entity.status = dto.Status;

            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Cập nhật trạng thái của người dùng (ví dụ: Active, Inactive, Blocked).
        /// </summary>
        /// <param name="id">ID của người dùng.</param>
        /// <param name="status">Trạng thái mới.</param>
        /// <returns>True nếu thành công, False nếu không tìm thấy.</returns>
        public async Task<bool> SetStatusAsync(int id, string status)
        {
            var entity = await _db.Users.FindAsync(id);
            if (entity is null) return false;

            // TODO: Nên kiểm tra xem 'status' có phải là một giá trị hợp lệ không
            entity.status = status;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            // Tối ưu truy vấn bằng cách sử dụng:
            // 1. AsNoTracking(): Vì đây là thao tác chỉ đọc.
            // 2. Select(): Chỉ chọn các cột cần thiết (Projection) thay vì kéo
            //    toàn bộ entity User và Renter. Đây là cách làm hiệu quả nhất.
            var userProfile = await _db.Users
                .AsNoTracking()
                .Where(u => u.user_id == userId)
                .Select(u => new UserProfileDto
                {
                    // UserId = u.user_id,
                    FullName = u.full_name,
                    Email = u.email,
                    PhoneNumber = u.phone_number,
                    DateOfBirth = u.date_of_birth,
                    // Giả định rằng mối quan hệ 1-1 giữa User và Renter luôn tồn tại
                    // cho một RENTER. Dùng '?' (null-conditional) để an toàn.
                    CurrentAddress = (u.Renter == null) ? null : u.Renter.current_address,
                    IsVerified = (u.Renter == null) ? false : u.Renter.is_verified,
                    RegistrationDate = (u.Renter == null) ? default : u.Renter.registration_date
                })
                .FirstOrDefaultAsync();

            return userProfile;
        }

        public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UserProfileUpdateDto dto)
        {
            var user = await _db.Users
                .Include(u => u.Renter)
                .FirstOrDefaultAsync(u => u.user_id == userId);

            if (user == null)
            {
                return null; // Không tìm thấy user
            }

            // ✅ LOGIC MỚI: Chỉ cập nhật nếu giá trị DTO không null
            // Điều này áp dụng cho tất cả các trường.

            if (dto.FullName != null)
            {
                user.full_name = dto.FullName;
            }

            // .HasValue là cách kiểm tra an toàn cho kiểu nullable DateTime?
            if (dto.DateOfBirth.HasValue)
            {
                user.date_of_birth = DateOnly.FromDateTime(dto.DateOfBirth.Value);
            }

            // Đối với các trường vốn đã nullable (PhoneNumber, CurrentAddress),
            // chúng ta cũng áp dụng logic tương tự.
            if (dto.PhoneNumber != null)
            {
                user.phone_number = dto.PhoneNumber;
            }

            if (user.Renter != null && dto.CurrentAddress != null)
            {
                user.Renter.current_address = dto.CurrentAddress;
            }

            // Lưu bất kỳ thay đổi nào đã được thực hiện
            await _db.SaveChangesAsync();

            // Trả về profile mới nhất
            return await GetProfileAsync(userId);
        }

        public async Task<(bool Success, string ErrorMessage)> ChangePasswordAsync(int userId, ChangePasswordRequestDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return (false, "Người dùng không tồn tại.");
            }

            // Kiểm tra mật khẩu hiện tại
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.password_hash))
            {
                return (false, "Mật khẩu hiện tại không đúng.");
            }
                    
            // Hash mật khẩu mới và cập nhật
            user.password_hash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }

    }
}