// BusinessLogicLayer/DTOs/User/UserProfileUpdateDto.cs
using System.ComponentModel.DataAnnotations; // Thêm thư viện để validation

namespace BusinessLogicLayer.DTOs.User
{
    public class UserProfileUpdateDto
    {
        // Optional: user có thể bỏ qua trường này khi update -> nullable
        [StringLength(255, ErrorMessage = "Họ và tên đầy đủ phải dài tối đa 255 ký tự.")]
        public string? FullName { get; set; }

        // Optional phone; Phone attribute sẽ validate format nếu có value
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        [StringLength(20, ErrorMessage = "Số điện thoại phải dài tối đa 20 ký tự.")]
        public string? PhoneNumber { get; set; }

        // Optional: dùng DateTime? để cho phép không cập nhật ngày sinh
        // DataType.Date giúp UI/Swagger/ModelBinder hiểu đây là ngày (không có thời gian)
        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [StringLength(255, ErrorMessage = "Địa chỉ phải dài tối đa 255 ký tự.")]
        public string? CurrentAddress { get; set; }
    }
}