# 📝 Ghi chú thay đổi: ExtraFeesController.cs

**Mục đích:** Controller này dùng cho Staff để ghi nhận các khoản phạt/phụ thu vào một đơn hàng cụ thể.

## Các thay đổi & Logic bổ sung:

### 1. Tự động lấy giá tiền (Automation)
- Trong hàm POST, nếu Staff chọn loại phí (ví dụ: `FeeTypeId = 1`) mà không nhập số tiền cụ thể (để `Amount = null`), hệ thống sẽ tự động lấy giá mặc định từ bảng `FeeType`.
- **Lợi ích:** Giúp Staff thao tác nhanh hơn, đỡ phải nhớ giá tiền.

### 2. Snapshot dữ liệu (Lịch sử)
- Khi lưu `ExtraFee`, tớ code thêm đoạn lưu luôn `FeeName` (tên loại phí) vào bảng `ExtraFee`.
- **Lý do:** Để sau này dù Admin có đổi tên "Phí vệ sinh" thành "Phí dọn dẹp" trong danh mục, thì các đơn hàng cũ vẫn hiển thị đúng tên gọi tại thời điểm bị phạt.

### 3. Nâng cấp API hiển thị (GET ByOrder)
- Hàm `GetExtraFeesByOrder` được viết lại dùng `.Include(e => e.FeeType)`.
- **Lợi ích:** Frontend khi gọi API này sẽ nhận được luôn tên loại phí (`FeeTypeName`) để hiển thị ngay lập tức, không cần gọi thêm API khác để tra cứu tên.
