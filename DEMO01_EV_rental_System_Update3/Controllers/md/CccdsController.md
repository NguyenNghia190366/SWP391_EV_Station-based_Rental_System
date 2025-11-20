# 📝 CccdsController.cs - Nhật ký thay đổi

**Vai trò:** Bộ điều khiển cho Người thuê để quản lý tài liệu CCCD (Chứng minh nhân dân) của họ.

## Những thay đổi chính

### 🔒 Bảo mật (Ngăn chặn IDOR)
- **Tiêm `ICurrentUserAccessor`** để trích xuất ID người dùng từ mã thông báo xác thực
- **Quan trọng:** Xóa `RenterId` hoặc `UserId` do khách hàng cung cấp khỏi thân yêu cầu
    - Hệ thống tự động xác định người yêu cầu thông qua mã thông báo xác thực
    - Ngăn chặn Người A sửa đổi CCCD của Người B

### ➕ API mới: `UploadMyCccd` (Mô hình Upsert)
Kết hợp các thao tác Tạo và Cập nhật thành một điểm cuối duy nhất.

**Logic:**
- Nếu không có CCCD tồn tại → Tạo bản ghi mới
- Nếu CCCD tồn tại → Cập nhật bản ghi hiện có

**Quy tắc kinh doanh:**
- Khi Người thuê tải lên hình ảnh mới, hệ thống tự động đặt lại `IsVerified = false`
- Cần xác minh lại từ đầu bởi Quản trị viên
- Ngăn chặn lạm dụng trạng thái đã xác minh sau khi thay thế hình ảnh

### 👁️ API mới: `MyCccd`
Cho phép Người thuê xem an toàn các tài liệu CCCD đã tải lên của họ.