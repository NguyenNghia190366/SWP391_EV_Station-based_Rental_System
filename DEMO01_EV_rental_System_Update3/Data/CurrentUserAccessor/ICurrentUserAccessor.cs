namespace DEMO01_EV_rental_System.Data.CurrentUserAccessor
{
    public interface ICurrentUserAccessor
    {
        int UserId { get; }
        int? RenterId { get; }
        int? StaffId { get; }
        string Role { get; }
    }
}