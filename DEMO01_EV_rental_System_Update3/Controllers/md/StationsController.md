# 📝 Ghi chú Merge Code (Huy gửi Nghĩa)

**Gửi Nghĩa:** Tớ đã hoàn thành module `StationsController.cs`. Đây là các thay đổi chính:

## 1. Nâng cấp API GET (Search & Paging)

- API GET giờ hỗ trợ tìm kiếm theo tên/địa chỉ và phân trang
- **VD:** `api/Stations?search=HCM&page=1` sẽ tìm các trạm có chữ "HCM"
- Thêm trường `CurrentVehiclesCount` vào kết quả trả về để biết trạm đó đang có bao nhiêu xe

## 2. Bảo mật POST/PUT

- Tớ đã thay thế tham số `Station` entity bằng `StationCreateDto` và `StationUpdateDto`
- **Lý do:** Tránh việc client gửi các dữ liệu không mong muốn (Over-posting)

## 3. Logic an toàn khi DELETE

Trước khi xóa trạm, hệ thống sẽ tự động kiểm tra 3 điều kiện:

- Có xe nào đang đậu ở đó không?
- Có nhân viên nào thuộc trạm đó không?
- Có đơn hàng nào liên quan (nhận/trả xe) ở đó không?

**Kết quả:** Nếu có bất kỳ điều kiện nào thỏa mãn, API sẽ trả về lỗi `400 Bad Request` thay vì xóa, giúp bảo vệ dữ liệu hệ thống không bị lỗi.