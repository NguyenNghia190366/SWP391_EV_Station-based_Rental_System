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
    public class ExtraFeesController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public ExtraFeesController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/ExtraFees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExtraFee>>> GetExtraFees()
        {
            return await _context.ExtraFees.ToListAsync();
        }

        [HttpGet("{order_id}")]
        public async Task<ActionResult<IEnumerable<ExtraFee>>> GetExtraFeesbyOrderId(int order_id)
        {
            var extraFees = await _context.ExtraFees.Where(x=> x.OrderId == order_id).ToListAsync();

            if (extraFees == null || !extraFees.Any())
            {
                return NotFound();
            }

            return extraFees;
        }

        // GET: api/ExtraFees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExtraFee>> GetExtraFee(int id)
        {
            var extraFee = await _context.ExtraFees.FindAsync(id);

            if (extraFee == null)
            {
                return NotFound();
            }

            return extraFee;
        }

        // PUT: api/ExtraFees/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExtraFee(int id, ExtraFee extraFee)
        {
            if (id != extraFee.FeeId)
            {
                return BadRequest();
            }

            _context.Entry(extraFee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExtraFeeExists(id))
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

        // POST: api/ExtraFees
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ExtraFee>> PostExtraFee(ExtraFee extraFee)
        {
            //var feetype = await _context.FeeTypes.FirstOrDefaultAsync(x => x.FeeTypeId == extraFee.FeeTypeId);
            //if(feetype != null)
            //{
            //    var order = await _context.RentalOrders.FirstOrDefaultAsync(x => x.OrderId == extraFee.OrderId);
            //    var vehicle = await _context.Vehicles.FirstOrDefaultAsync(x => x.VehicleId == order.VehicleId);
            //    var vehicle_model = await _context.VehicleModels.FirstOrDefaultAsync(x => x.VehicleModelId == vehicle.VehicleModelId);
            //    extraFee.Amount = vehicle_model.price_per_hour 
            //}
            _context.ExtraFees.Add(extraFee);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetExtraFee", new { id = extraFee.FeeId }, extraFee);
        }

        // DELETE: api/ExtraFees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExtraFee(int id)
        {
            var extraFee = await _context.ExtraFees.FindAsync(id);
            if (extraFee == null)
            {
                return NotFound();
            }

            _context.ExtraFees.Remove(extraFee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ExtraFeeExists(int id)
        {
            return _context.ExtraFees.Any(e => e.FeeId == id);
        }
    }
}
