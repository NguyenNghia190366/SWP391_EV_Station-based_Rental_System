using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RentersController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public RentersController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/Renters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Renter>>> GetRenters()
        {
            return await _context.Renters.ToListAsync();
        }

        // GET: api/Renters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Renter>> GetRenter(int id)
        {
            var renter = await _context.Renters.FindAsync(id);

            if (renter == null)
            {
                return NotFound();
            }

            return renter;
        }

        // PUT: api/Renters/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRenter(int id, Renter renter)
        {
            renter.RenterId = id;

            _context.Entry(renter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RenterExists(id))
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

        // POST: api/Renters
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Renter>> PostRenter(Renter renter)
        {
            _context.Renters.Add(renter);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRenter", new { id = renter.RenterId }, renter);
        }

        // DELETE: api/Renters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRenter(int id)
        {
            var renter = await _context.Renters.FindAsync(id);
            if (renter == null)
            {
                return NotFound();
            }

            _context.Renters.Remove(renter);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RenterExists(int id)
        {
            return _context.Renters.Any(e => e.RenterId == id);
        }


        [HttpPut("VerifyRenter/{id}")]
        public async Task<IActionResult> VerifyRenter(int id)
        {
            var renter = await _context.Renters.FindAsync(id);
            if (renter == null)
            {
                return NotFound();
            }
            renter.IsVerified = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        
    }
}
