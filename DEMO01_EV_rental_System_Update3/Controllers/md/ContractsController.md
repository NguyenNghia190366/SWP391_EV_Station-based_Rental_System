# 📝 Ghi chú thay đổi: ContractsController.cs

**Mục đích:** Quản lý việc tạo hợp đồng thuê xe giữa Staff và Khách hàng. Đây là bước "chốt" quan trọng để chuyển trạng thái đơn hàng sang giai đoạn "Đang thuê" (IN_USE).

---

## Chi tiết các thay đổi so với source gốc:

### 1. Tạo Hợp đồng (POST): Nâng cấp Logic nghiệp vụ

#### Bảo mật:
- Loại bỏ tham số `StaffId` từ client gửi lên
- Hệ thống tự lấy ID nhân viên đang đăng nhập từ Token

#### Quy trình chặt chẽ (Workflow Validation):
- Chỉ cho phép tạo hợp đồng khi đơn hàng (RentalOrder) đang ở trạng thái `APPROVED` (Code cũ cho phép tạo vô tội vạ)
- Kiểm tra trùng lặp: Đảm bảo mỗi đơn hàng chỉ có duy nhất 1 hợp đồng

#### Tự động hóa (Automation):
- Ngay sau khi tạo hợp đồng thành công, hệ thống tự động:
    - Chuyển trạng thái đơn hàng sang `IN_USE`
    - Khóa xe (`IsAvailable = false`)
    - Staff không cần phải gọi thêm API sửa đơn hàng nữa
- Lưu dữ liệu giao xe: Hỗ trợ lưu ảnh hiện trạng xe trước khi giao (`ImgVehicleBeforeUrls`) nếu có

---
### 2. Xem danh sách (GET): Hiển thị đầy đủ thông tin

#### Cải tiến dữ liệu trả về:
| **Code cũ** | **Code mới** |
|-------------|--------------|
| Chỉ trả về các ID (`StaffId`, `OrderId`) | Sử dụng `.Include()` để load kèm thông tin chi tiết |
| Frontend không hiển thị được thông tin | Hiển thị: Tên nhân viên, Tên khách hàng, Biển số xe, Tên mẫu xe |

#### Phân quyền truy cập:
- **Renter (Khách hàng):** Chỉ xem được hợp đồng của chính mình
- **Admin/Staff:** Xem được toàn bộ hợp đồng trong hệ thống

---

### 3. Cập nhật Hợp đồng (PUT): Giới hạn quyền

#### So sánh thay đổi:
| **Code cũ** | **Code mới** |
|-------------|--------------|
| Cho phép sửa toàn bộ thông tin hợp đồng (nguy hiểm) | Chỉ cho phép cập nhật đường dẫn file PDF (`ContractPdfUrl`) sau khi ký xong |

#### Lưu ý quan trọng:
> **⚠️ Chữ ký điện tử:** Các trường lưu ảnh chữ ký (`ContractRenterSigningimgUrl`, `ContractOwnerSigningimgUrl`) hiện tại đang comment lại (tạm ẩn) do Entity Contract trong code hiện tại chưa có các cột này (dù trong SQL đã có). Sẽ mở lại sau khi update Entity.

---

### 4. Xóa Hợp đồng (DELETE):

- Giữ nguyên logic xóa cơ bản của cậu (Nghĩa)