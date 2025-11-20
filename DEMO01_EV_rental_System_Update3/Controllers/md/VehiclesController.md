# 📝 Ghi chú Merge Code (Huy gửi Nghĩa)

**Gửi Nghĩa:** Tớ đã hoàn thành module `VehiclesController.cs`. Đây là các thay đổi tớ đã merge vào:

## ✨ Cải thiện hàm GET (Search & Filter)

- Tớ đã gộp hàm search cũ vào hàm `GetVehicles` chính
- Giờ API hỗ trợ filter mạnh mẽ hơn: `?search=...&stationId=...&isAvailable=true&minBattery=50`
- Sử dụng `Include` để khi lấy xe sẽ hiện luôn tên Model và tên Station (thông qua DTO `VehicleViewDto`)

## 🔒 An toàn hóa POST & PUT

- Thay vì nhận nguyên `Vehicle` entity (dễ bị lỗi bảo mật over-posting), tớ tạo ra `VehicleCreateDto` và `VehicleUpdateDto`
- **POST:** Tự động check trùng biển số xe. Check xem `StationId` và `ModelId` có tồn tại không trước khi thêm
- **PUT:** Gộp logic update vị trí và update trạng thái

## ⚙️ Business Logic (Quan trọng)

- **Tự động cập nhật trạng thái:** Khi tạo hoặc sửa, nếu set `Condition` là `IN_REPAIR` hoặc `DAMAGED`, hệ thống sẽ tự động set `IsAvailable = false`. Không bao giờ có chuyện xe hỏng mà vẫn hiện available cho khách thuê
- **Bảo vệ dữ liệu:** Khi Xóa (Delete), tớ thêm check: Nếu xe đã từng có đơn hàng (`RentalOrder`), hệ thống sẽ chặn xóa để bảo toàn lịch sử giao dịch

