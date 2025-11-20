using System.Security.Claims;

namespace DEMO01_EV_rental_System.Data.CurrentUserAccessor
{
    public class CurrentUserAccessor : ICurrentUserAccessor                     
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal? User
        {
            get
            {
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext == null) return null;
                return httpContext.User;
            }
        }
        
        // Lấy từ claim "sub" (NameIdentifier)
        public int UserId 
        {
            get
            {
                var id = User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(id, out var userId) ? userId : 0;
            }
        }

        // Lấy từ claim "renterId"
        public int? RenterId
        {
            get
            {
                var id = User?.FindFirstValue("renterId");
                return int.TryParse(id, out var renterId) ? renterId : (int?)null;
            }
        }

        // Lấy từ claim "staffId"
        public int? StaffId
        {
            get
            {
                var id = User?.FindFirstValue("staffId");
                return int.TryParse(id, out var staffId) ? staffId : (int?)null;
            }
        }

        // Lấy từ claim "role"
        public string Role => User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }
}