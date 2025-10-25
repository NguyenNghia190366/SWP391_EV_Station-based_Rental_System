using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.FlowAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
        [Authorize(Roles = "ADMIN")]
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
        [Authorize(Roles = "RENTER")]
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
        [HttpPut("UpdateProfile")]
        public async Task<IActionResult> PutUser(int User_id, RegisterDto dto)
        {
            try
            {
                var update_user = await _context.Users.FindAsync(User_id);
                if (update_user != null)
                {
                    update_user.FullName = dto.FullName;
                    update_user.Email = dto.Email;
                    update_user.PhoneNumber = dto.PhoneNumber;
                    update_user.Password_Hash = dto.Password;
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
        [Authorize(Roles = "ADMIN")]
        [HttpPost("CreateStaff")]
        public async Task<ActionResult<User>> CreateStaff(string fullname, string email, string phone_number, string password, DateOnly dateOfBirth, int stationid)
        {

            RegisterDto dto = new RegisterDto
            {
                FullName = fullname,
                Email = email,
                PhoneNumber = phone_number,
                Password = password,
                DateOfBirth = dateOfBirth,
            };

            User user = new User();
            user.Email = email;
            user.FullName = fullname;
            user.PhoneNumber = phone_number;
            user.DateOfBirth = dateOfBirth;
            user.Password_Hash = password;
            user.Role = "RENTER";
            user.Status = "active";
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var station = await _context.Stations.FindAsync(stationid);

            Staff staff = new Staff();
            staff.Station = station;
            staff.User = user;
            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, dto);
        }


        //Cho khách hàng đăng ký tài khoản
        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<ActionResult<User>> Regisgter(RegisterDto dto)
        {

            PasswordHasher passwordHasher = new PasswordHasher();
            User user = new User();
            user.Email = dto.Email;
            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.DateOfBirth = dto.DateOfBirth;
            user.Password_Hash = passwordHasher.HashPasswordByBcrypt(dto.Password);
            user.Role = "RENTER";
            user.Status = "active";
            _context.Users.Add(user);

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
            public DateOnly DateOfBirth { get; set; }
            public string Address { get; set; }
        }


        // DELETE: api/Users/5
        [Authorize(Roles ="ADMIN")]
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
        [Authorize(Roles = "ADMIN")]
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
        [Authorize(Roles = "ADMIN")]
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
        public async Task<IActionResult> ChangePassword(int User_id, String password)
        {
            try
            {
                var update_user = await _context.Users.FindAsync(User_id);
                if (update_user != null)
                {
                    update_user.Password_Hash = password;
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

    }
}
