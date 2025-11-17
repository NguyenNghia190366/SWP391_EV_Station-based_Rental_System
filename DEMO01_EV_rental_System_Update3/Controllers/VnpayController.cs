using Azure;
using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using DEMO01_EV_rental_System.VNPAY;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/vnpay")]
    [ApiController]
    [Authorize]
    public class VnpayController : Controller
    {
        private readonly IVnPayService _vnPayService;
        private readonly RentalEvSystemFinalContext _context;

        public PaymentsController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
            _context = new RentalEvSystemFinalContext();
        }

        [HttpPost("create-refund")]
        public IActionResult Createrefund(VnPaymentRequestModel model)
        {
            var order = _context.RentalOrders.FirstOrDefault(x => x.OrderId == model.OrderId);
            if (order == null)
            {
                return BadRequest();
            }
            var paymentUrl = _vnPayService.CreateRefundUrl(HttpContext, model);
            PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
            paymentRequest.OrderId = model.OrderId;
            paymentRequest.url = paymentUrl;
            return Ok(paymentRequest); 
        }


        [HttpPost("create-payment")]
        public IActionResult CreatePayment(VnPaymentRequestModel model)
        {
            var order = _context.RentalOrders.FirstOrDefault(x => x.OrderId == model.OrderId);
            if (order == null)
            {
                return BadRequest();
            }



            var paymentUrl = _vnPayService.CreatePaymentUrl(HttpContext, model);
            PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
            paymentRequest.OrderId = model.OrderId;
            paymentRequest.url = paymentUrl;
            return Ok(paymentRequest);
        }


        [HttpPost("only-pay-payment")]
        public IActionResult PayPayment(VnPaymentRequestModelWithAnPayment model)
        {
            //var order = _context.RentalOrders.FirstOrDefault(x => x.OrderId == model.OrderId);
            //if (order == null)
            //{
            //    return BadRequest();
            //}

            var payment = _context.Payments.FirstOrDefault(x => x.PaymentId == model.PaymentId);
            if (payment == null)
            {
                return BadRequest("No payment right there, please check carefully");
            }

            var paymentUrl = _vnPayService.CreatePaymentUrlWithAnPayment(HttpContext, model);
            PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
            paymentRequest.OrderId = model.OrderId;
            paymentRequest.url = paymentUrl;
            return Ok(paymentRequest);
        }

        [AllowAnonymous]
        [HttpGet("vnpay_return")]
        public IActionResult PaymentReturn()
        {
            var response = _vnPayService.PaymentExcute(Request.Query);
            var order = _context.RentalOrders.FirstOrDefault(x => x.OrderId == response.order_id);

            var renter = _context.Renters.FirstOrDefault(x => x.RenterId == order.RenterId);
            var user = _context.Users.FirstOrDefault(x => x.UserId == renter.UserId);

            var vehicle = _context.Vehicles.FirstOrDefault(x => x.VehicleId == order.VehicleId);
            vehicle.IsAvailable = false;
            _context.Vehicles.Update(vehicle);
            _context.SaveChanges();
            return Redirect("return url");
        }
    }
}
