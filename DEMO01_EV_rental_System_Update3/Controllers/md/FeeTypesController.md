# 📝 FeeTypesController.cs - Ghi chú Thay đổi

**Mục đích:** Controller quản trị để quản lý các danh mục loại phí (ví dụ: Phí Vệ sinh, Phí Trả muộn, v.v.).

## Các Thay đổi & Logic Đã thêm

### 1. Data Transfer Objects (DTOs)
- Triển khai `FeeTypeCreateDto` và `FeeTypeUpdateDto` thay vì nhận trực tiếp entity `FeeType`
- **Lý do:** API rõ ràng hơn, bảo mật tốt hơn, ngăn client gửi dữ liệu không cần thiết

### 2. Xác thực Tên Trùng lặp (Business Logic)
- Thêm xác thực trong phương thức POST (Create) và PUT (Update) để kiểm tra tên loại phí trùng lặp
- **Lợi ích:** Ngăn xung đột danh mục (ví dụ: không thể tạo hai mục "Phí Vệ sinh")

### 3. Bảo vệ Xóa
- Triển khai xác thực ràng buộc khóa ngoại
- **Logic:** Nếu một loại phí được tham chiếu trong bất kỳ bản ghi `ExtraFee` nào, hệ thống chặn việc xóa và trả về lỗi cụ thể
- **Mục đích:** Bảo toàn tính toàn vẹn lịch sử giao dịch

