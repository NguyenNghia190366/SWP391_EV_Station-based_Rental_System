using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RentalOrdersController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public RentalOrdersController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/RentalOrders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RentalOrder>>> GetRentalOrders()
        {
            return await _context.RentalOrders.ToListAsync();
        }

        // GET: api/RentalOrders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RentalOrder>> GetRentalOrder(int id)
        {
            var rentalOrder = await _context.RentalOrders.FindAsync(id);

            if (rentalOrder == null)
            {
                return NotFound();
            }

            return rentalOrder;
        }

        // PUT: api/RentalOrders/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRentalOrder(int id, RentalOrder rentalOrder)
        {
            if (id != rentalOrder.OrderId)
            {
                return BadRequest();
            }

            _context.Entry(rentalOrder).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RentalOrderExists(id))
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

        [HttpPut("/Inuse")]
        public async Task<IActionResult> InuseOrder(int id)
        {

            try
            {
                var order = await _context.RentalOrders.FirstOrDefaultAsync(x => x.OrderId == id);
                if (order != null)
                {
                    order.Status = "IN_USE";
                }
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RentalOrderExists(id))
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

        [HttpPut("/Complete")]
        public async Task<IActionResult> CompleteOrder(int id)
        {

            try
            {
                var order = await _context.RentalOrders.FirstOrDefaultAsync(x => x.OrderId == id);
                if (order != null)
                {
                    order.Status = "COMPLETED";
                }
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RentalOrderExists(id))
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

        [HttpPut("/Reject")]
        public async Task<IActionResult> RejectOrder(int id)
        {

            try
            {
                var order = await _context.RentalOrders.FirstOrDefaultAsync(x => x.OrderId == id);
                if (order != null)
                {
                    order.Status = "CANCELED";
                }
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RentalOrderExists(id))
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


        [HttpPut("/Approve")]
        public async Task<IActionResult> ApproveOrder(int id)
        {
            
            try
            {
                var order = await _context.RentalOrders.FirstOrDefaultAsync(x => x.OrderId == id);
                if (order != null)
                {
                    order.Status = "APPROVED";
                }
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RentalOrderExists(id))
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
        // POST: api/RentalOrders
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<RentalOrder>> PostRentalOrder(OrderMakingDto rentalOrderDTO)
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(x => x.VehicleId == rentalOrderDTO.VehicleId);
            if (vehicle == null)
            {
                return NotFound();
            }
            if(!vehicle.IsAvailable)
            {
                return BadRequest();
            }

            if(rentalOrderDTO.StartTime.CompareTo(DateTime.UtcNow) < 0){
                return BadRequest();
            }

            if(rentalOrderDTO.StartTime.CompareTo(rentalOrderDTO.EndTime) >= 0)
            {
                return BadRequest();
            }

            var rentalOrder = new RentalOrder
            {
                RenterId = rentalOrderDTO.RenterId,
                VehicleId = rentalOrderDTO.VehicleId,
                PickupStationId = rentalOrderDTO.PickupStationId,
                ReturnStationId = rentalOrderDTO.ReturnStationId,
                StartTime = rentalOrderDTO.StartTime,
                EndTime = rentalOrderDTO.EndTime,
                //Status = "Pending",
                //CreatedAt = DateTime.UtcNow
            };
            _context.RentalOrders.Add(rentalOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRentalOrder", new { id = rentalOrder.OrderId }, rentalOrderDTO);
        }

        public class OrderMakingDto
        {
            public int RenterId { get; set; }

            public int VehicleId { get; set; }

            public int? PickupStationId { get; set; }

            public int? ReturnStationId { get; set; }

            public DateTime StartTime { get; set; }

            public DateTime? EndTime { get; set; }

            
        }

        // DELETE: api/RentalOrders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRentalOrder(int id)
        {
            var rentalOrder = await _context.RentalOrders.FindAsync(id);
            if (rentalOrder == null)
            {
                return NotFound();
            }

            _context.RentalOrders.Remove(rentalOrder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RentalOrderExists(int id)
        {
            return _context.RentalOrders.Any(e => e.OrderId == id);
        }
    }
}
