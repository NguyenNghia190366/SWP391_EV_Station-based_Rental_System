# PaymentssController.cs – Ghi chú thay đổi

Tóm tắt: Đã hoàn tất module Payment, dùng kỹ thuật mapping để tránh sửa DB.

## 1. Mô tả (Description / Note)
- Vấn đề: Bảng Payment không có cột Description hoặc Note.
- Giải pháp: Tái sử dụng cột `ExternalRef`.
- Ứng dụng: Khi Staff tạo phí phạt (vd: "Làm xước xe") hoặc ghi chú hoàn tiền → ghi vào `ExternalRef`.
- Frontend: Hiển thị giá trị `ExternalRef` như mô tả.

## 2. Hoàn tiền (RequestRefund)
- Vấn đề: `RentalOrder` không có `DepositAmount`.
- Giải pháp: Truy vấn lịch sử Payment:
    - Tìm Payment có `Type_payment = "PAY"` và trạng thái `PAID` của đúng Order.
    - Lấy số tiền đó làm căn cứ hoàn tiền.
- Đảm bảo hoàn đúng số khách đã nộp.

## 3. Tối ưu hiệu suất
- Tránh vòng lặp lồng nhau để lọc Payment theo Renter.
- Dùng `Include(p => p.Order)` + lọc ngay trên query (SQL).
- Kết quả: Nhanh hơn, giảm tải bộ nhớ.

## 4. Loại bỏ MoMo
- Đã xóa toàn bộ logic MoMo.
- Giữ VNPAY (ở controller khác) + thêm hỗ trợ thanh toán tiền mặt (Cash).

## Ghi chú triển khai
- `ExternalRef` hiện đóng vai trò trường đa dụng (mô tả / tham chiếu nghiệp vụ).
- Logic hoàn tiền phụ thuộc lịch sử Payment hợp lệ (loại PAY + PAID).
- Có thể bổ sung cột riêng sau nếu schema được cập nhật.