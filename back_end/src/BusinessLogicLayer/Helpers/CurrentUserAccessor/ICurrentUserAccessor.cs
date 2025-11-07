namespace BusinessLogicLayer.Helpers.CurrentUserAccessor
{
    public interface ICurrentUserAccessor
    {
        int UserId { get; }
        int? RenterId { get; }
        int? StaffId { get; }
        string Role { get; }
    }
}