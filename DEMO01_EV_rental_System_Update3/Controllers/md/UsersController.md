1. Vá lỗ hổng bảo mật IDOR (Quan trọng nhất)
    - hàm PutUser() v& ChangePassword() cũ đang nhận parameter User_id từ client. 
        ==> vì client có thể gửi ID của admin để đổi mật khẩu/profile của admin.

    - Sửa:
        - xóa parameter "int User_id".
        - lấy UserId của người đang đăng nhập từ token (dùng _currentUserAccessor).
        ==> user A chỉ có thể tự cập nhật chính user A.

2. Dependency Injection
    - inject ICurrentUserAccessor (Data/CurrentUserAccessor) vào constructor của UsersController.
    - đăng ký trong Program.cs: 
        + "services.AddHttpContextAccessor()" 
        + "services.AddScoped<ICurrentUserAccessor,CurrentUserAccessor>()"

3. Cải thiện logic check PutUser()
    - Vấn đề: Logic check email/SĐT cũ sẽ báo lỗi "email is exist" ngay cả khi user chỉ update FullName mà giữ nguyên email của mình.
    - Sửa: Tớ đã sửa lại logic: "Chỉ báo lỗi khi email/SĐT này tồn tại và thuộc về một người dùng khác."