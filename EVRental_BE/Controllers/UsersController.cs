using Microsoft.AspNetCore.Mvc;

namespace EVRental_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        [HttpGet]
        public ActionResult<object> GetUsers()
        {
            // Return mock data for now
            return Ok(new[] 
            {
                new { userId = "admin001", email = "admin@evrental.com", role = "ADMIN" },
                new { userId = "renter001", email = "renter.verified@gmail.com", role = "RENTER" }
            });
        }
    }
}
