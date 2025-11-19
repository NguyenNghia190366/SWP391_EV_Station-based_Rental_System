# 📝 RentersController.cs - Changelog

**Vai trò:** Quản lý người thuê & duyệt hồ sơ (Admin/Staff)

## Thay đổi chính

### 1. API GET - Hiển thị đầy đủ thông tin
- **Trước:** Chỉ có dữ liệu từ bảng `Renter` (ID, địa chỉ)
- **Sau:** Dùng `.Include()` để lấy thêm:
    - `User`: FullName, Email, PhoneNumber
    - `Cccd` & `DriverLicense`: Số giấy tờ, ảnh
- **Lợi ích:** 1 API call = đủ thông tin hiển thị

### 2. Bộ lọc (Filter)
- Tham số: `?pendingOnly=true`
- Lọc nhanh người chưa xác thực (`IsVerified == false`)

### 3. API VerifyRenter - Duyệt hồ sơ
- Chức năng: Set `IsVerified = true`
- **TODO:** Tích hợp Notification sau khi merge module (cái này là bảng Notifications).
