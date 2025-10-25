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
    public class CccdsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public CccdsController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/Cccds
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cccd>>> GetCccds()
        {
            return await _context.Cccds.ToListAsync();
        }

        // GET: api/Cccds/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cccd>> GetCccd(int id)
        {
            var cccd = await _context.Cccds.FindAsync(id);

            if (cccd == null)
            {
                return NotFound();
            }

            return cccd;
        }

        // PUT: api/Cccds/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCccd(int id, Cccd cccd)
        {
            if (id != cccd.renter_Id)
            {
                return BadRequest();
            }

            _context.Entry(cccd).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CccdExists(id))
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

        // POST: api/Cccds
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Cccd>> PostCccd(Cccd cccd)
        {
            _context.Cccds.Add(cccd);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (CccdExists(cccd.renter_Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetCccd", new { id = cccd.renter_Id }, cccd);
        }

        // DELETE: api/Cccds/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCccd(int id)
        {
            var cccd = await _context.Cccds.FindAsync(id);
            if (cccd == null)
            {
                return NotFound();
            }

            _context.Cccds.Remove(cccd);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CccdExists(int id)
        {
            return _context.Cccds.Any(e => e.renter_Id == id);
        }
    }
}
