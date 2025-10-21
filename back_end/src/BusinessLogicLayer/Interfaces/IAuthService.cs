using BusinessLogicLayer.DTOs.Auth;

namespace BusinessLogicLayer.Interfaces
{
    /// <summary>
    /// Giao diện cho dịch vụ xác thực, quản lý đăng nhập, đăng ký và token.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Xử lý đăng nhập cho người dùng.
        /// </summary>
        /// <param name="request">Thông tin email và mật khẩu.</param>
        /// <returns>Một đối tượng LoginResponse chứa token nếu thành công, ngược lại trả về null.</returns>
        Task<LoginResponse?> LoginAsync(LoginRequest request);

        /// <summary>
        /// Xử lý đăng ký tài khoản mới cho Renter.
        /// </summary>
        /// <param name="request">Thông tin chi tiết để đăng ký tài khoản.</param>
        /// <returns>Một đối tượng LoginResponse chứa token của tài khoản vừa tạo.</returns>
        Task<LoginResponse> RegisterAsync(RegisterRequestDto request);
    }
}