using Microsoft.AspNetCore.Mvc;

namespace EVRental_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Driver_LicenseController : ControllerBase
    {
        /// <summary>
        /// MOCK: Get driver license by renter_id
        /// GET /api/Driver_License?renter_id={userId}
        /// </summary>
        [HttpGet]
        public ActionResult<object> GetByRenterId([FromQuery] string renter_id)
        {
            if (string.IsNullOrEmpty(renter_id))
            {
                return BadRequest(new { message = "renter_id is required" });
            }

            // MOCK: Return verification status based on dummy accounts
            // Support both userId and email for lookup
            var verificationData = new Dictionary<string, object>
            {
                ["renter001"] = new { 
                    license_number = "B2-123456789", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-10),
                    expiry_date = DateTime.UtcNow.AddYears(5)
                },
                ["renter.verified@gmail.com"] = new { 
                    license_number = "B2-123456789", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-10),
                    expiry_date = DateTime.UtcNow.AddYears(5)
                },
                ["renter002"] = new { 
                    license_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    expiry_date = (DateTime?)null
                },
                ["renter.nolicense@gmail.com"] = new { 
                    license_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    expiry_date = (DateTime?)null
                },
                ["renter003"] = new { 
                    license_number = "B2-987654321", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-5),
                    expiry_date = DateTime.UtcNow.AddYears(4)
                },
                ["renter.nocccd@gmail.com"] = new { 
                    license_number = "B2-987654321", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-5),
                    expiry_date = DateTime.UtcNow.AddYears(4)
                },
                ["renter004"] = new { 
                    license_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    expiry_date = (DateTime?)null
                },
                ["renter.new@gmail.com"] = new { 
                    license_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    expiry_date = (DateTime?)null
                }
            };

            if (verificationData.ContainsKey(renter_id))
            {
                return Ok(verificationData[renter_id]);
            }

            // Default: not verified
            return Ok(new { 
                license_number = (string?)null, 
                is_verified = false,
                verified_at = (DateTime?)null,
                expiry_date = (DateTime?)null
            });
        }
    }
}
