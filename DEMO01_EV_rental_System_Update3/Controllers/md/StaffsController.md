# 📝 Ghi chú Merge Code (Huy gửi Nghĩa)

**Gửi Nghĩa:** Tớ đã hoàn thành module `StaffsController.cs`. Đây là những nâng cấp chính:

## 1. Hiển thị đầy đủ thông tin (GET)
- **Vấn đề cũ:** API chỉ trả về `UserId` và `StationId` (số), nhìn vào không biết ai là ai.
- **Giải pháp:** Sử dụng `Include` để lấy thêm `FullName`, `Email` từ bảng `User` và `StationName` từ bảng `Station`.
- **Kết quả:** API trả về `StaffViewDto` rất rõ ràng.

## 2. Điều chuyển nhân viên (PUT)
- Sử dụng `StaffUpdateDto` để tập trung vào việc cập nhật `StationId` (Assign Staff).
- Thêm logic kiểm tra: Nếu gán vào một trạm không tồn tại, API sẽ báo lỗi ngay thay vì để DB crash.

## 3. An toàn khi Xóa (DELETE)
- **Kiểm tra ràng buộc:** Không cho xóa nhân viên nếu họ đã từng ký hợp đồng (`Contracts`) để bảo toàn lịch sử giấy tờ.
- **Tự động cập nhật:** Khi xóa hồ sơ Staff, tự động reset role của User đó về `RENTER`.

## 4. Tạo mới (POST)
- Kiểm tra xem `UserId` đó đã là nhân viên chưa (tránh trùng lặp 1 người 2 hồ sơ staff).
- Tự động cập nhật `Role` của User thành `STAFF`.
