using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverLicensesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public DriverLicensesController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/DriverLicenses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DriverLicense>>> GetDriverLicenses()
        {
            return await _context.DriverLicenses.ToListAsync();
        }

        // GET: api/DriverLicenses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DriverLicense>> GetDriverLicense(int id)
        {
            var driverLicense = await _context.DriverLicenses.FindAsync(id);

            if (driverLicense == null)
            {
                return NotFound();
            }

            return driverLicense;
        }

        // PUT: api/DriverLicenses/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDriverLicense(int id, DriverLicense driverLicense)
        {
            if (id != driverLicense.Renter_Id)
            {
                return BadRequest();
            }

            _context.Entry(driverLicense).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DriverLicenseExists(id))
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

        // POST: api/DriverLicenses
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DriverLicense>> PostDriverLicense(DriverLicense driverLicense)
        {
            _context.DriverLicenses.Add(driverLicense);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (DriverLicenseExists(driverLicense.Renter_Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetDriverLicense", new { id = driverLicense.Renter_Id }, driverLicense);
        }

        [HttpPost("UploadBang")]
        public async Task<ActionResult<DriverLicense>> UploadBangLaiXe(PostDriverLisenceDTO postDriverLisenceDTO)
        {
            DriverLicense driverLicense = new DriverLicense
            {
                DriverLicenseNumber = postDriverLisenceDTO.DriverLicenseNumber,
                url_Driver_License_back = postDriverLisenceDTO.url_Driver_License_back,
                url_Driver_License_front = postDriverLisenceDTO.url_Driver_License_front,
                Renter_Id = postDriverLisenceDTO.Renter_Id,
            };
            _context.DriverLicenses.Add(driverLicense);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (DriverLicenseExists(driverLicense.Renter_Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetDriverLicense", new { id = driverLicense.Renter_Id }, postDriverLisenceDTO);
        }
        // DELETE: api/DriverLicenses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDriverLicense(int id)
        {
            var driverLicense = await _context.DriverLicenses.FindAsync(id);
            if (driverLicense == null)
            {
                return NotFound();
            }

            _context.DriverLicenses.Remove(driverLicense);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DriverLicenseExists(int id)
        {
            return _context.DriverLicenses.Any(e => e.Renter_Id == id);
        }
    }
}
