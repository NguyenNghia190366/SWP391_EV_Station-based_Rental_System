using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Data.CurrentUserAccessor;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;
        private readonly ICurrentUserAccessor _currentUserAccessor;


        public UsersController(RentalEvSystemFinalContext context, ICurrentUserAccessor currentUserAccessor)
        {
            _context = context;
            _currentUserAccessor = currentUserAccessor;

        }

        // GET: api/Users
        //In toàn bộ user, cho thằng front end mệt sml
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            List<User> list = await _context.Users.ToListAsync();
            foreach (User user in list)
            {
                user.Password_Hash = "";
            }
            return list;

        }

        // GET: api/Users/5
        //Tìm user theo id của họ
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        //Cho khách hàng, staff tự update profile của mình
        public class UpdateUserInfoDto
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public DateOnly DateOfBirth { get; set; }
            public string Address { get; set; } = string.Empty;
        }
        [HttpPut("UpdateProfile")]
        public async Task<IActionResult> PutUser(UpdateUserInfoDto dto)
        {
            // Lấy ID của user đang login
            var currentUserId = _currentUserAccessor.UserId;
            if (currentUserId == 0)
            {
                return Unauthorized("Token không hợp lệ hoặc không tìm thấy User ID.");
            }

            try
            {
                var update_user = await _context.Users.FindAsync(currentUserId); // <-- Dùng ID từ token

                if (update_user != null)
                {
                    update_user.FullName = dto.FullName;

                    // Chỗ này logic của Nghĩa có vấn đề:
                    // Nếu tớ update profile nhưng không đổi email, nó cũng sẽ báo "email is exist"
                    // Cần sửa lại logic check:
                    var emailExists = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                    if (emailExists != null && emailExists.UserId != currentUserId) // <-- Check xem email đó có phải của NGƯỜI KHÁC không
                    {
                        return BadRequest("Email này đã được người khác sử dụng.");
                    }
                    update_user.Email = dto.Email;

                    // Tương tự cho SĐT
                    var phoneExists = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber);
                    if (phoneExists != null && phoneExists.UserId != currentUserId)
                    {
                        return BadRequest("Số điện thoại này đã được người khác sử dụng.");
                    }
                    update_user.PhoneNumber = dto.PhoneNumber;

                    update_user.DateOfBirth = dto.DateOfBirth;

                    var renter = await _context.Renters.FirstOrDefaultAsync(r => r.UserId == currentUserId);
                    if (renter != null)
                    {
                        renter.CurrentAddress = dto.Address;
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(currentUserId)) // <-- Dùng ID từ token
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        public class CreateAccountForStaffDto
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public DateOnly DateOfBirth { get; set; }

            public int StationId { get; set; }

        }

        //Cho khách hàng đăng ký tài khoản
        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<ActionResult<User>> Regisgter(RegisterDto dto)
        {
            PasswordHasher passwordHasher = new PasswordHasher();
            string pattern_sdt = @"^(0|\+84)(3[2-9]|5[6,8,9]|7[0-9]|8[1-9]|9[0-9])\d{7}$";
            if (Regex.IsMatch(dto.PhoneNumber, pattern_sdt) == false)
            {
                return BadRequest("Invalid phone number format");
            }
            string patternemail = @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"; ;
            if (!Regex.IsMatch(dto.Email, patternemail))
            {
                return BadRequest("Invalid email format");
            }
            User user = new User();
            user.FullName = dto.FullName;
            var user1 = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
            if (user1 != null)
            {
                return BadRequest("email is exist");
            }
            user.Email = dto.Email;
            var user2 = _context.Users.FirstOrDefault(u => u.PhoneNumber == dto.PhoneNumber);
            if (user2 != null)
            {
                return BadRequest("Phone number is exist");
            }
            user.PhoneNumber = dto.PhoneNumber;
            user.DateOfBirth = dto.DateOfBirth;
            if (!dto.Password.Equals(dto.ConfirmPassword))
            {
                return BadRequest("The confirm password need to match password");
            }
            user.Password_Hash = passwordHasher.HashPasswordByBcrypt(dto.Password);
            user.Role = "RENTER";
            user.Status = "Active";
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            Renter renter = new Renter();
            renter.User = user;
            renter.UserId = user.UserId;
            renter.CurrentAddress = dto.Address;
            renter.IsVerified = false;
            _context.Renters.Add(renter);
            await _context.SaveChangesAsync();


            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, dto);

        }




        // DTO class dùng để truyền dữ liệu khi tạo link
        public class RegisterDto
        {
            public string FullName { get; set; }= string.Empty;
            public string Email { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string ConfirmPassword { get; set; } = string.Empty;
            public DateOnly DateOfBirth { get; set; }
            public string Address { get; set; } = string.Empty;
        }


        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }

        //Đi ban acc user quậy
        //[Authorize(Roles = "ADMIN")]
        [HttpPut("ChangeStatusToBanAccount")]
        public async Task<IActionResult> BanStatus(int User_id)
        {
            try
            {
                var update_user = await _context.Users.FindAsync(User_id);
                if (update_user != null)
                {
                    update_user.Status = "Blocked";
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(User_id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        //Này là giúp cho mấy account biết quay đầu là bờ, tu tâm dưỡng tánh
        //[Authorize(Roles = "ADMIN")]
        [HttpPut("ChangeStatusToOpenTheAccount")]
        public async Task<IActionResult> OpenStatus(int User_id)
        {
            try
            {
                var update_user = await _context.Users.FindAsync(User_id);
                if (update_user != null)
                {
                    update_user.Status = "Active";
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(User_id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }


        [HttpPut("ChangePassword")]
        public async Task<IActionResult> ChangePassword(string old_password, string new_password)
        {
            // try
            // {
            //     var update_user = await _context.Users.FindAsync(User_id);
            //     PasswordHasher passwordHasher = new PasswordHasher();
            //     if (update_user == null || !(passwordHasher.VerifyPassword(old_password, update_user.Password_Hash)))
            //     {
            //         return NotFound("Password is invalid");
            //     }

            //     update_user.Password_Hash = passwordHasher.HashPasswordByBcrypt(password);
            //     await _context.SaveChangesAsync();

            // }
            // catch (DbUpdateConcurrencyException)
            // {
            //     if (!UserExists(User_id))
            //     {
            //         return NotFound();
            //     }
            //     else
            //     {
            //         throw;
            //     }
            // }
            // return NoContent();
            var currentUserId = _currentUserAccessor.UserId;

            if (currentUserId == 0)
            {
                return Unauthorized();
            }
            try
            {
                var update_user = await _context.Users.FindAsync(currentUserId); // <-- Dùng ID từ token
                PasswordHasher passwordHasher = new PasswordHasher();    
                if (update_user == null || !(passwordHasher.VerifyPassword(old_password, update_user.Password_Hash)))
                {
                    return BadRequest("Mật khẩu hiện tại không đúng.");
                }
                update_user.Password_Hash = passwordHasher.HashPasswordByBcrypt(new_password);
                await _context.SaveChangesAsync();
            }

            catch (DbUpdateConcurrencyException)
            {
                // (Giữ logic của Nghĩa, nhưng sửa User_id)
                if (!UserExists(currentUserId)) 
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();

        }

    }
}
