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
    public class VehicleModelsController : ControllerBase
    {
        private readonly RentalEvSystemFinalContext _context;

        public VehicleModelsController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        // GET: api/VehicleModels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleModel>>> GetVehicleModels()
        {
            return await _context.VehicleModels.ToListAsync();
        }

        [AllowAnonymous]
        [HttpGet("Search={name}")]
        public async Task<ActionResult<IEnumerable<VehicleModel>>> GetVehicleModelsByName(string name)
        {
            var list = await _context.VehicleModels.ToListAsync();
            List<VehicleModel> searched_List = new List<VehicleModel>();
            foreach (var EV in list)
            {
                if (EV.BrandName.Contains(name))
                {

                    searched_List.Add(EV);
                }
            }
            return searched_List;
        }

        // GET: api/VehicleModels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VehicleModel>> GetVehicleModel(int id)
        {
            var vehicleModel = await _context.VehicleModels.FindAsync(id);

            if (vehicleModel == null)
            {
                return NotFound();
            }

            return vehicleModel;
        }

        // PUT: api/VehicleModels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVehicleModel(int id, VehicleModel vehicleModel)
        {
            if (id != vehicleModel.VehicleModelId)
            {
                return BadRequest();
            }

            _context.Entry(vehicleModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VehicleModelExists(id))
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

        // POST: api/VehicleModels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<VehicleModel>> PostVehicleModel(VehicleModel vehicleModel)
        {
            _context.VehicleModels.Add(vehicleModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVehicleModel", new { id = vehicleModel.VehicleModelId }, vehicleModel);
        }

        // DELETE: api/VehicleModels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicleModel(int id)
        {
            var vehicleModel = await _context.VehicleModels.FindAsync(id);
            if (vehicleModel == null)
            {
                return NotFound();
            }

            _context.VehicleModels.Remove(vehicleModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VehicleModelExists(int id)
        {
            return _context.VehicleModels.Any(e => e.VehicleModelId == id);
        }


    }
}
