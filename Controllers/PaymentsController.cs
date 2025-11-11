using DEMO01_EV_rental_System.VNPAY;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/vnpay")]
    [ApiController]
    [Authorize]
    public class PaymentsController : Controller
    {
        private readonly IVnPayService _vnPayService;

        public PaymentsController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        [HttpPost]
        public IActionResult CreatePayment(VnPaymentRequestModel model)
        {
            var paymentUrl = _vnPayService.CreatePaymentUrl(HttpContext, model);
            return Redirect(paymentUrl);
        }

        [HttpGet]
        public IActionResult PaymentReturn()
        {
            var response = _vnPayService.PaymentExcute(Request.Query);
            return Json(response);
        }
    }
}
