📝 Ghi chú Merge Code (Huy gửi Nghĩa)
Gửi Nghĩa: Tớ đã cập nhật file VehicleModelsController.cs và "merge" logic của Huy vào nhé:
### Các cập nhật chính:

1. **Khắc phục lỗi bảo mật (Over-posting):**
    - Các hàm POST (tạo mới) và PUT (cập nhật) hiện chỉ nhận các DTO `VehicleModelCreateDto` hoặc `VehicleModelUpdateDto` thay vì nhận trực tiếp entity `VehicleModel`.
    - Điều này giúp ngăn chặn việc client gửi dữ liệu không hợp lệ hoặc dư thừa vào cơ sở dữ liệu.

2. **Cải thiện hiệu suất (N+1 Query):**
    - Đã gộp hàm GET (lấy danh sách) và GET (tìm kiếm với `search={name}`) thành một hàm duy nhất.
    - Logic tìm kiếm (search) và phân trang (page, pageSize) được thực hiện trực tiếp trên SQL Server bằng các phương thức `Where`, `Skip`, `Take`, thay vì tải toàn bộ dữ liệu về rồi mới lọc ở C#.
    - Cách sử dụng mới: `GET api/VehicleModels?search=Vin&page=1&pageSize=10`

3. **Bổ sung ràng buộc nghiệp vụ (Business Logic):**
    - **POST / PUT:** Thêm kiểm tra tính duy nhất (unique) cho tên Model + BrandName, không cho phép trùng lặp.
    - **DELETE:** Kiểm tra không cho phép xóa mẫu xe nếu vẫn còn xe (Vehicle) đang sử dụng mẫu đó.
    - **GET:** Các hàm GET trả về `VehicleModelViewDto` (bao gồm trường `VehiclesCount` - số lượng xe thuộc mẫu đó), giúp frontend dễ xử lý hơn.
