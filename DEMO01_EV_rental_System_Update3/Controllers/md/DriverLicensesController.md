# 📝 Ghi chú thay đổi: DriverLicensesController.cs

## Vai trò
Controller này dành cho Renter tự thao tác với Bằng lái xe.

## Chi tiết các thay đổi

### Bảo mật & Logic Upsert
- Tương tự như CccdsController, tớ đã áp dụng cơ chế lấy ID từ Token.
- API UploadMyLicense xử lý cả trường hợp chưa có bằng lái hoặc muốn cập nhật lại ảnh bằng lái.

### Logic Reset trạng thái xác thực
- Bất kỳ thay đổi nào về số bằng lái hoặc ảnh chụp đều sẽ kích hoạt `IsVerified = false` cho tài khoản Renter đó. Điều này đảm bảo tính toàn vẹn dữ liệu của quy trình xác thực danh tính (KYC).
