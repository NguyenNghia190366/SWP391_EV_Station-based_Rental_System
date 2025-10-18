using BusinessLogicLayer.DTOs.Auth;

namespace BusinessLogicLayer.Interfaces
{
    /// <summary>
    /// Xác thực người dùng và phát hành JWT.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Đăng nhập bằng Username/Password.
        /// Trả về LoginResponse (Token, Role, UserId) hoặc null nếu sai.
        /// </summary>
        Task<LoginResponse?> LoginAsync(LoginRequest request);
    }
}
