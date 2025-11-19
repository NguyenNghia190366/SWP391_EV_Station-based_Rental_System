using DEMO01_EV_rental_System.Data;
using DEMO01_EV_rental_System.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Collections.Specialized.BitVector32;

namespace DEMO01_EV_rental_System.Controllers
{
    [Route("api/Payments")]
    [ApiController]
    [Authorize]
    public class PaymentssController : ControllerBase
    {
        RentalEvSystemFinalContext _context;

        public PaymentssController(RentalEvSystemFinalContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<Payment>>> AddPayments(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPayment", new { id = payment.PaymentId }, payment);
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayment()
        {
            return await _context.Payments.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(x => x.PaymentId == id);
            if(payment == null)
            {
                return NotFound();
            }
            return payment;
        }

        [HttpGet("{renter_id}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentbyrenter_id(int renter_id)
        {
            var listOrder = await _context.RentalOrders.Where(x => x.RenterId == renter_id).ToListAsync();
            var listPayment = await _context.Payments.ToListAsync();
            List<Payment> paymentsFillter = new List<Payment>();
            for (int i = 0; i < listPayment.Count; i++)
            {
                for (int l = 0; l < listOrder.Count; l++)
                {

                    if (listPayment[i].OrderId == listOrder[l].OrderId)
                    {
                        paymentsFillter.Add(listPayment[i]);
                    }
                }
            }
            return paymentsFillter;
        }
    }
}
