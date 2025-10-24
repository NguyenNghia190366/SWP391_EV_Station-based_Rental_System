using DEMO01_EV_rental_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DEMO01_EV_rental_System.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class UserAccountController : ControllerBase
    {
        private readonly JwtService _jwtService;
        public UserAccountController(JwtService jwtService)
        {
            _jwtService = jwtService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login(LoginRequestDTO request)
        {
            var result = await _jwtService.Authenticate(request);
            if(result is null)
            {
                return Unauthorized();
            }
            return result;
        }

    }
}
