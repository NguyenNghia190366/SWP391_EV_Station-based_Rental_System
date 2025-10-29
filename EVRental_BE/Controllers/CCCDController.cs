using Microsoft.AspNetCore.Mvc;

namespace EVRental_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CCCDController : ControllerBase
    {
        /// <summary>
        /// MOCK: Get CCCD by renter_id
        /// GET /api/CCCD/{renterId}
        /// </summary>
        [HttpGet("{renterId}")]
        public ActionResult<object> GetByRenterId(string renterId)
        {
            if (string.IsNullOrEmpty(renterId))
            {
                return BadRequest(new { message = "renterId is required" });
            }

            // MOCK: Return verification status based on dummy accounts
            // Support both userId and email for lookup
            var verificationData = new Dictionary<string, object>
            {
                ["renter001"] = new { 
                    cccd_number = "079200123456", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-10),
                    full_name = "Lê Văn Khách",
                    dob = new DateTime(1995, 5, 15),
                    address = "123 Nguyễn Huệ, Q1, TP.HCM"
                },
                ["renter.verified@gmail.com"] = new { 
                    cccd_number = "079200123456", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-10),
                    full_name = "Lê Văn Khách",
                    dob = new DateTime(1995, 5, 15),
                    address = "123 Nguyễn Huệ, Q1, TP.HCM"
                },
                ["renter002"] = new { 
                    cccd_number = "079200654321", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-8),
                    full_name = "Phạm Thị Mới",
                    dob = new DateTime(1998, 8, 20),
                    address = "456 Lê Lợi, Q1, TP.HCM"
                },
                ["renter.nolicense@gmail.com"] = new { 
                    cccd_number = "079200654321", 
                    is_verified = true,
                    verified_at = DateTime.UtcNow.AddDays(-8),
                    full_name = "Phạm Thị Mới",
                    dob = new DateTime(1998, 8, 20),
                    address = "456 Lê Lợi, Q1, TP.HCM"
                },
                ["renter003"] = new { 
                    cccd_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    full_name = (string?)null,
                    dob = (DateTime?)null,
                    address = (string?)null
                },
                ["renter.nocccd@gmail.com"] = new { 
                    cccd_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    full_name = (string?)null,
                    dob = (DateTime?)null,
                    address = (string?)null
                },
                ["renter004"] = new { 
                    cccd_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    full_name = (string?)null,
                    dob = (DateTime?)null,
                    address = (string?)null
                },
                ["renter.new@gmail.com"] = new { 
                    cccd_number = (string?)null, 
                    is_verified = false,
                    verified_at = (DateTime?)null,
                    full_name = (string?)null,
                    dob = (DateTime?)null,
                    address = (string?)null
                }
            };

            if (verificationData.ContainsKey(renterId))
            {
                return Ok(verificationData[renterId]);
            }

            // Default: not verified
            return Ok(new { 
                cccd_number = (string?)null, 
                is_verified = false,
                verified_at = (DateTime?)null,
                full_name = (string?)null,
                dob = (DateTime?)null,
                address = (string?)null
            });
        }
    }
}
