using BusinessLogicLayer.DTOs.Contract;
using BusinessLogicLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu đăng nhập cho tất cả API trong Controller này
    public class ContractsController : ControllerBase
    {
        private readonly IContractsService _contractsService;

        public ContractsController(IContractsService contractsService)
        {
            _contractsService = contractsService;
        }

        /// <summary>
        /// [Staff, Admin] Tạo hợp đồng mới (khi check-in cho khách)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "STAFF, ADMIN")] // Chỉ Staff hoặc Admin
        public async Task<IActionResult> CreateContract([FromBody] ContractCreateDto createDto)
        {
            try
            {
                // === (2) GỌI HÀM SERVICE MỚI (không cần staffId) ===
                var newContract = await _contractsService.CreateContractAsync(createDto);

                return CreatedAtAction(nameof(GetContractById), new { id = newContract.ContractId }, newContract);
            }
            catch (KeyNotFoundException knfEx)
            {
                return NotFound(new { message = knfEx.Message });
            }
            catch (InvalidOperationException ioEx)
            {
                return BadRequest(new { message = ioEx.Message });
            }
            catch (UnauthorizedAccessException uaEx) // Bắt lỗi mới từ Service
            {
                return Forbid(uaEx.Message); // 403
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi máy chủ nội bộ: {ex.Message}" });
            }
        }

        /// <summary>
        /// [Staff, Admin] Lấy danh sách tất cả hợp đồng (cho Admin/Staff)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "STAFF, ADMIN")] // Chỉ Staff hoặc Admin
        public async Task<IActionResult> GetAllContracts([FromQuery] ContractListQuery query)
        {
            var result = await _contractsService.GetAllContractsAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// [Renter] Lấy danh sách hợp đồng của cá nhân tôi
        /// </summary>
        [HttpGet("my-contracts")]
        [Authorize(Roles = "RENTER")] // Chỉ Renter
        public async Task<IActionResult> GetMyContracts([FromQuery] ContractListQuery query)
        {
            // Lấy renter_id từ token
            var renterIdClaim = User.FindFirst("renterId"); // "renterId" là key cậu lưu trong token
            if (renterIdClaim == null || !int.TryParse(renterIdClaim.Value, out int renterId))
            {
                return Unauthorized("Không thể xác thực Renter ID từ token.");
            }

            var result = await _contractsService.GetContractsByRenterAsync(renterId, query);
            return Ok(result);
        }

        /// <summary>
        /// [Tất cả] Lấy chi tiết 1 hợp đồng
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContractById(int id)
        {
            var contract = await _contractsService.GetContractByIdAsync(id);
            if (contract == null)
            {
                return NotFound(new { message = "Không tìm thấy hợp đồng." });
            }

            // --- (Nâng cao) Kiểm tra quyền sở hữu ---
            // Nếu là Renter, kiểm tra xem có đúng là hợp đồng của họ không
            if (User.IsInRole("RENTER"))
            {
                var renterIdClaim = User.FindFirst("renterId");
                if (renterIdClaim == null || !int.TryParse(renterIdClaim.Value, out int renterId))
                {
                    return Unauthorized();
                }

                if (contract.RenterInfo?.RenterId != renterId)
                {
                    return Forbid("Bạn không có quyền xem hợp đồng này.");
                }
            }
            // Nếu là Staff/Admin thì được xem

            return Ok(contract);
        }

        /// <summary>
        /// [Staff, Admin] Cập nhật URL file PDF (sau khi upload file)
        /// </summary>
        [HttpPut("{id}/pdf-url")]
        [Authorize(Roles = "STAFF, ADMIN")]
        public async Task<IActionResult> UpdatePdfUrl(int id, [FromBody] string pdfUrl)
        {
            if (string.IsNullOrWhiteSpace(pdfUrl))
            {
                return BadRequest("URL không được để trống.");
            }

            var result = await _contractsService.UpdateContractPdfUrlAsync(id, pdfUrl);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy hợp đồng để cập nhật." });
            }

            return NoContent(); // 204 No Content - Thành công














        }
    }
}