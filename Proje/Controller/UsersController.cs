using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.FlowAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;


        public UsersController(RentalEvSystemFinalContext context)
        {
            _context = context;

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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //Cho khách hàng, staff tự update profile của mình
        public class UpdateUserInfoDto
        {
            public string FullName { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
            public DateOnly DateOfBirth { get; set; }
            public string Address { get; set; }
        }
        [HttpPut("UpdateProfile")]
        public async Task<IActionResult> PutUser(int User_id, UpdateUserInfoDto dto)
        {
            try
            {
                var update_user = await _context.Users.FindAsync(User_id);
                if (update_user != null)
                {
                    update_user.FullName = dto.FullName;
                    var user1 = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
                    if (user1 != null)
                    {
                        return BadRequest("email is exist");
                    }
                    update_user.Email = dto.Email;
                    var user2 = _context.Users.FirstOrDefault(u => u.PhoneNumber == dto.PhoneNumber);
                    if (user2 != null)
                    {
                        return BadRequest("Phone number is exist");
                    }
                    
                    update_user.PhoneNumber = dto.PhoneNumber;
                    update_user.DateOfBirth = dto.DateOfBirth;
                    // Cập nhật địa chỉ cho Renter nếu có
                    var renter = await _context.Renters.FirstOrDefaultAsync(r => r.UserId == User_id);
                    if (renter != null)
                    {
                        renter.CurrentAddress = dto.Address;
                    }
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

        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

        //Tạo tài khoản cho staff, việc này sẽ do admin làm
        //[Authorize(Roles = "ADMIN")]
        //[HttpPost("CreateStaff")]
        //public async Task<ActionResult<User>> CreateStaff(CreateAccountForStaffDto StaffDto)
        //{


        //    User user = new User();
        //    if (check_user_email_or_exist(StaffDto.Email))
        //    {
        //        return BadRequest("Email is exist");
        //    }
        //    if (check_user_email_or_exist(StaffDto.PhoneNumber))
        //    {
        //        return BadRequest("Phone number is exist");
        //    }
        //    user.Email = StaffDto.Email;
        //    user.FullName = StaffDto.FullName;
        //    user.PhoneNumber = StaffDto.PhoneNumber;
        //    user.DateOfBirth = StaffDto.DateOfBirth;
        //    user.Password_Hash = StaffDto.Password;
        //    user.Role = "STAFF";
        //    user.Status = "active";
        //    _context.Users.Add(user);
        //    await _context.SaveChangesAsync();

        //    var station = await _context.Stations.FindAsync(StaffDto.StationId);

        //    Staff staff = new Staff();
        //    staff.Station = station;
        //    staff.User = user;
        //    _context.Staff.Add(staff);
        //    await _context.SaveChangesAsync();


        //    return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, StaffDto);
        //}
        public class CreateAccountForStaffDto
        {
            public string FullName { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
            public string Password { get; set; }
            public DateOnly DateOfBirth { get; set; }

            public int StationId { get; set; }

        }

        //Cho khách hàng đăng ký tài khoản
        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<ActionResult<User>> Regisgter(RegisterDto dto)
        {


            PasswordHasher passwordHasher = new PasswordHasher();
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
            public string FullName { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
            public string Password { get; set; }
            public string ConfirmPassword { get; set; }
            public DateOnly DateOfBirth { get; set; }
            public string Address { get; set; }
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
        public async Task<IActionResult> ChangePassword(int User_id,string old_password, string password)
        {
            try
            {
                var update_user = await _context.Users.FindAsync(User_id);
                PasswordHasher passwordHasher = new PasswordHasher();
                if (update_user == null || !(passwordHasher.VerifyPassword(old_password, update_user.Password_Hash)))
                {
                    return NotFound("Password is invalid");
                }
                
                    update_user.Password_Hash = passwordHasher.HashPasswordByBcrypt(password);
                    await _context.SaveChangesAsync();
                
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

    }
}
