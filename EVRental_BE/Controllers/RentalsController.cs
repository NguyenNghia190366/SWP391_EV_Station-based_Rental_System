using Microsoft.AspNetCore.Mvc;

namespace EVRental_BE.Controllers
{
    [Route("api/rentals")]
    [ApiController]
    public class RentalsController : ControllerBase
    {
        /// <summary>
        /// GET /api/rentals/{rentalId}/checkin-details
        /// Get check-in details for a rental
        /// </summary>
        [HttpGet("{rentalId}/checkin-details")]
        public ActionResult<object> GetCheckInDetails(string rentalId)
        {
            // MOCK: Return check-in details
            return Ok(new
            {
                id = rentalId,
                bookingCode = $"BK{rentalId.ToUpper()}",
                status = "CONFIRMED",
                vehicle = new
                {
                    id = "VEH001",
                    name = "VinFast VF e34",
                    licensePlate = "30A-12345",
                    batteryCapacity = 42,
                    imageUrl = "/images/vf-e34.jpg"
                },
                station = new
                {
                    id = "STN001",
                    name = "Trạm Quận 1",
                    address = "123 Nguyễn Huệ, Quận 1, TP.HCM",
                    phone = "0901234567"
                },
                startTime = DateTime.Now.AddHours(1),
                endTime = DateTime.Now.AddDays(2),
                renter = new
                {
                    id = "renter001",
                    name = "Lê Văn Khách",
                    phone = "0901234567"
                }
            });
        }

        /// <summary>
        /// POST /api/rentals/{rentalId}/self-checkin
        /// Self check-in via mobile app
        /// </summary>
        [HttpPost("{rentalId}/self-checkin")]
        public ActionResult<object> SelfCheckIn(string rentalId, [FromBody] CheckInRequest request)
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(rentalId))
            {
                return BadRequest(new { message = "Rental ID is required" });
            }

            // MOCK: Process self check-in
            var checkInResult = new
            {
                success = true,
                message = "Nhận xe thành công!",
                rentalId = rentalId,
                checkInTime = request.CheckInTime ?? DateTime.Now,
                vehicleCondition = request.VehicleCondition,
                unlockCode = GenerateUnlockCode(),
                instructions = new[]
                {
                    "Tiếp cận xe với mã mở khóa: " + GenerateUnlockCode(),
                    "Kiểm tra pin và khoảng cách có thể di chuyển",
                    "Chụp ảnh xe trước khi xuất phát",
                    "Bắt đầu chuyến đi và tận hưởng!"
                }
            };

            return Ok(checkInResult);
        }

        /// <summary>
        /// POST /api/rentals/{rentalId}/staff-checkin
        /// Staff assisted check-in at counter
        /// </summary>
        [HttpPost("{rentalId}/staff-checkin")]
        public ActionResult<object> StaffCheckIn(string rentalId, [FromBody] StaffCheckInRequest request)
        {
            if (string.IsNullOrWhiteSpace(rentalId) || string.IsNullOrWhiteSpace(request.StaffId))
            {
                return BadRequest(new { message = "Rental ID and Staff ID are required" });
            }

            // MOCK: Process staff check-in
            return Ok(new
            {
                success = true,
                message = "Nhận xe thành công tại quầy!",
                rentalId = rentalId,
                checkInTime = DateTime.Now,
                staffId = request.StaffId,
                staffName = "Trần Thị Staff",
                vehicleCondition = request.VehicleCondition,
                unlockCode = GenerateUnlockCode()
            });
        }

        /// <summary>
        /// POST /api/rentals/{rentalId}/condition-photos
        /// Upload vehicle condition photos
        /// </summary>
        [HttpPost("{rentalId}/condition-photos")]
        public async Task<ActionResult<object>> UploadConditionPhotos(string rentalId, [FromForm] IFormFileCollection photos)
        {
            if (photos == null || photos.Count == 0)
            {
                return BadRequest(new { message = "No photos uploaded" });
            }

            // MOCK: Simulate photo upload
            var uploadedPhotos = new List<object>();
            foreach (var photo in photos)
            {
                // In real implementation, save to storage (Azure Blob, AWS S3, etc.)
                uploadedPhotos.Add(new
                {
                    fileName = photo.FileName,
                    size = photo.Length,
                    uploadedAt = DateTime.Now,
                    url = $"/uploads/rentals/{rentalId}/{photo.FileName}"
                });
            }

            return Ok(new
            {
                success = true,
                message = $"Uploaded {photos.Count} photos successfully",
                photos = uploadedPhotos
            });
        }

        /// <summary>
        /// GET /api/rentals/verify/{bookingCode}
        /// Verify booking code for check-in
        /// </summary>
        [HttpGet("verify/{bookingCode}")]
        public ActionResult<object> VerifyBooking(string bookingCode)
        {
            if (string.IsNullOrWhiteSpace(bookingCode))
            {
                return BadRequest(new { message = "Booking code is required" });
            }

            // MOCK: Verify booking code
            if (bookingCode.StartsWith("BK"))
            {
                return Ok(new
                {
                    valid = true,
                    rentalId = bookingCode.Replace("BK", ""),
                    status = "READY_FOR_CHECKIN",
                    vehicle = new { name = "VinFast VF e34", licensePlate = "30A-12345" }
                });
            }

            return NotFound(new { message = "Booking code not found" });
        }

        /// <summary>
        /// POST /api/rentals/{rentalId}/checkout
        /// Check-out (return vehicle)
        /// </summary>
        [HttpPost("{rentalId}/checkout")]
        public ActionResult<object> CheckOut(string rentalId, [FromBody] CheckOutRequest request)
        {
            // MOCK: Process check-out
            return Ok(new
            {
                success = true,
                message = "Trả xe thành công!",
                rentalId = rentalId,
                checkOutTime = DateTime.Now,
                vehicleCondition = request.VehicleCondition,
                finalMileage = request.FinalMileage,
                finalBatteryLevel = request.FinalBatteryLevel,
                charges = new
                {
                    basePrice = 500000,
                    extraMileageCharge = 0,
                    damageFee = 0,
                    cleaningFee = 0,
                    totalAmount = 500000
                }
            });
        }

        /// <summary>
        /// Helper: Generate unlock code
        /// </summary>
        private string GenerateUnlockCode()
        {
            var random = new Random();
            return random.Next(1000, 9999).ToString();
        }
    }

    // DTOs
    public class CheckInRequest
    {
        public DateTime? CheckInTime { get; set; }
        public VehicleConditionDto? VehicleCondition { get; set; }
        public string? CheckInMethod { get; set; }
    }

    public class StaffCheckInRequest
    {
        public string StaffId { get; set; } = string.Empty;
        public VehicleConditionDto? VehicleCondition { get; set; }
    }

    public class CheckOutRequest
    {
        public VehicleConditionDto? VehicleCondition { get; set; }
        public int FinalMileage { get; set; }
        public int FinalBatteryLevel { get; set; }
    }

    public class VehicleConditionDto
    {
        public string? ExteriorCondition { get; set; }
        public string? InteriorCondition { get; set; }
        public int BatteryLevel { get; set; }
        public int Mileage { get; set; }
        public string? Notes { get; set; }
    }
}
