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
    public class FeeTypesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public FeeTypesController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/FeeTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeeType>>> GetFeeTypes()
        {
            return await _context.FeeTypes.ToListAsync();
        }

        // GET: api/FeeTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FeeType>> GetFeeType(int id)
        {
            var feeType = await _context.FeeTypes.FindAsync(id);

            if (feeType == null)
            {
                return NotFound();
            }

            return feeType;
        }

        // PUT: api/FeeTypes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFeeType(int id, FeeType feeType)
        {
            if (id != feeType.FeeTypeId)
            {
                return BadRequest();
            }

            _context.Entry(feeType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FeeTypeExists(id))
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

        // POST: api/FeeTypes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<FeeType>> PostFeeType(FeeType feeType)
        {
            _context.FeeTypes.Add(feeType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFeeType", new { id = feeType.FeeTypeId }, feeType);
        }

        // DELETE: api/FeeTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeeType(int id)
        {
            var feeType = await _context.FeeTypes.FindAsync(id);
            if (feeType == null)
            {
                return NotFound();
            }

            _context.FeeTypes.Remove(feeType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FeeTypeExists(int id)
        {
            return _context.FeeTypes.Any(e => e.FeeTypeId == id);
        }
    }
}
