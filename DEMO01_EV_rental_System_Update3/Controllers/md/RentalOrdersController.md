# 📝 Ghi chú Merge Code (Huy gửi Nghĩa)

**Gửi Nghĩa:** Module `RentalOrdersController` đã được nâng cấp toàn diện về logic nghiệp vụ và bảo mật. Đây là chi tiết:

## 1. Quy trình Tạo đơn (POST) An toàn

- **Chặn ID giả mạo:** API không nhận `RenterId` từ client nữa. Hệ thống tự lấy ID từ Token đăng nhập.
- **Check Trùng lịch (Overlap):** Đây là logic quan trọng nhất. Hệ thống sẽ kiểm tra xem trong khoảng thời gian khách chọn, chiếc xe đó đã có ai đặt chưa (`BOOKED`, `APPROVED` hoặc `IN_USE`). Nếu trùng → Báo lỗi ngay.
- **Validate Xe:** Check kỹ xem xe có tồn tại không và trạng thái `IsAvailable` có đang OK không.

## 2. Phân quyền xem đơn (GET)

- **Renter:** Khi gọi API lấy danh sách, chỉ nhìn thấy các đơn hàng của chính mình.
- **Admin/Staff:** Nhìn thấy toàn bộ đơn hàng của hệ thống.

## 3. Luồng trạng thái (State Machine) chuẩn

Tớ đã sửa logic bên trong các API chuyển trạng thái (`Approve`, `InUse`, `Complete`, `Reject`) để tuân thủ quy trình chặt chẽ:

- **Approve:** Chỉ duyệt được đơn đang `BOOKED`.
- **InUse (Giao xe):** Chỉ giao được đơn đã `APPROVED`. Lưu ID của Staff thực hiện giao xe.
- **Complete (Trả xe):**
    - Chỉ trả được đơn đang `IN_USE`.
    - Khi trả xe thành công: Tự động set `IsAvailable = true` cho xe và cập nhật vị trí xe về trạm trả (`ReturnStationId`).
    - Hỗ trợ nhận thông tin tình trạng xe sau khi trả (`Condition`) để update vào hồ sơ xe.

## 4. Bảo mật Hủy đơn (Reject)

- Renter chỉ được phép hủy đơn của chính mình và chỉ khi đơn chưa bắt đầu đi (`IN_USE`).
