Bạn nói rất đúng\! File README trước hơi ngắn gọn vì tôi tập trung vào "lệnh để chạy".

Một file README tốt (theo chuẩn nộp bài LAB 4) cần phải chi tiết, hướng dẫn người khác (như Giảng viên/TA) có thể "set up từ con số 0" và chạy được test của bạn.

Đây là phiên bản `README.md` chi tiết hơn rất nhiều. Bạn hãy đặt nó ở thư mục gốc (root) nhé.

-----

# README.md - Hướng dẫn Cài đặt & Chạy Kiểm thử (LAB 4)

Tài liệu này hướng dẫn chi tiết các bước để cài đặt môi trường, cấu hình, và chạy bộ kiểm thử đơn vị (Unit Test) cho dự án **`front_end`**.

Dự án sử dụng **React**, **Vite**, **Vitest** (thay cho Jest), và **React Testing Library (RTL)** để thực hiện kiểm thử.

## 1\. 🛠️ Yêu cầu Môi trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy của bạn đã cài đặt các phần mềm sau:

  * **Node.js:** (Khuyến nghị phiên bản 18.x trở lên)
  * **npm** (hoặc `pnpm`, `yarn`): Sẽ đi kèm khi cài Node.js.

> **Lưu ý quan trọng:** Tất cả các lệnh dưới đây đều phải được thực thi từ bên trong thư mục `front_end`. File README này nằm ở gốc, nhưng môi trường test thuộc về `front_end`.

## 2\. 📦 Cài đặt (Installation)

1.  **Mở Terminal** và di chuyển vào thư mục `front_end`:

    ```bash
    cd front_end
    ```

2.  **Cài đặt các thư viện (Dependencies):**
    Chạy lệnh sau để tải và cài đặt tất cả các thư viện của dự án (React, AntD...) và các thư viện kiểm thử (Vitest, RTL...).

    ```bash
    npm install
    ```

    *(Quá trình này có thể mất vài phút. Lệnh này sẽ đọc file `package.json` và `package-lock.json` để cài đặt.)*

## 3\. ⚙️ Cấu hình Môi trường Test (Test Configuration)

Dự án này sử dụng **Vitest**, một công cụ test hiện đại được tích hợp sâu với **Vite** (trình build của dự án). Bạn không cần cài đặt phức tạp như Jest/Babel.

Các file cấu hình chính đã có sẵn trong thư mục `front_end`:

1.  **`package.json`**:
    File này chứa các "scripts" để chạy test. Chúng ta sẽ sử dụng các lệnh này ở Bước 4.

    ```json
    "scripts": {
      "test": "vitest",
      "test:ui": "vitest --ui",
      "test:coverage": "vitest run --coverage"
      // ... các script khác
    }
    ```

2.  **`vitest.config.js`**:
    File này cấu hình Vitest. Các thiết lập quan trọng:

      * `globals: true`: Tự động import các hàm test (như `test`, `expect`, `describe`) vào mọi file test mà không cần import thủ công.
      * `environment: 'jsdom'`: Giả lập môi trường trình duyệt (DOM) để React Testing Library có thể render và tương tác với component ảo.
      * `setupFiles: './vitest.setup.js'`: Chỉ định file setup sẽ chạy trước khi bộ test bắt đầu.

3.  **`vitest.setup.js`**:
    File này dùng để import các thư viện bổ trợ. Quan trọng nhất là:

    ```javascript
    import '@testing-library/jest-dom';
    ```

    *Dòng này* cung cấp các hàm "matchers" hữu ích như `.toBeInTheDocument()`, `.toHaveValue()`... giúp việc viết test dễ đọc hơn.

4.  **Biến Môi trường (Environment Variables)**:
    Nếu ứng dụng của bạn sử dụng file `.env` (ví dụ: `VITE_API_URL`), các file test sẽ tự động chạy trong môi trường `test`. Vitest sẽ tự động tìm và nạp các biến từ file `.env.test` (nếu có) khi chạy test.

## 4\. 🧪 Cách Chạy Kiểm thử (Running Tests)

Sau khi đã `cd front_end` và `npm install`, bạn có thể chạy test bằng các lệnh sau:

### a. Chạy Test (Chế độ Watch)

Đây là chế độ bạn nên dùng khi đang *viết code* hoặc *viết test*.

```bash
npm test
```

  * **Chức năng:** Vitest sẽ khởi động và chạy toàn bộ test 1 lần. Sau đó, nó sẽ "theo dõi" (watch) mọi thay đổi trong file code. Nếu bạn sửa 1 file component hoặc 1 file test và bấm lưu, nó sẽ **tự động chạy lại** các test liên quan ngay lập tức.

### b. Chạy Báo cáo Coverage (Quan trọng nhất cho LAB 4)

[cite\_start]Đây là lệnh bạn **bắt buộc** phải chạy để tạo báo cáo và nộp bài, nhằm chứng minh độ bao phủ (coverage) đạt yêu cầu (ví dụ: ≥ 80%)[cite: 24, 126, 129].

```bash
npm run test:coverage
```

  * **Chức năng:**

    1.  Vitest sẽ chạy *tất cả* các file test 1 lần (ở chế độ "run", không "watch").
    2.  Nó sẽ phân tích xem code test của bạn đã chạy qua bao nhiêu dòng/hàm/nhánh trong code `src` của bạn.
    3.  Một báo cáo chi tiết sẽ được hiển thị ngay trên terminal.
    4.  Đồng thời, một thư mục mới tên là `front_end/coverage/` sẽ được tạo ra.

  * **Cách xem Báo cáo trực quan (Rất quan trọng):**
    Để xem báo cáo chi tiết dạng HTML, hãy mở file sau bằng trình duyệt (Chrome, Firefox...):
    `front_end/coverage/index.html`

    *(Giao diện này sẽ cho bạn biết chính xác file nào, dòng code nào chưa được test).*

### c. Chạy với Giao diện UI (Trực quan)

Vitest cung cấp một giao diện web rất đẹp để xem, lọc và chạy test.

```bash
npm run test:ui
```

  * **Chức năng:** Mở một trang web (thường là `http://localhost:51204/__vitest__/`) cho phép bạn xem trực quan file test nào pass/fail, và click để chạy lại từng test riêng lẻ.

## 5\. 🗂️ Cấu trúc Thư mục Test

Để giữ code ứng dụng (`src`) sạch sẽ, tất cả file test được đặt trong thư mục `front_end/tests`.

Cấu trúc thư mục `tests` sẽ **phản chiếu (mirror)** chính xác cấu trúc của thư mục `src`. Điều này giúp tìm kiếm file test cực kỳ dễ dàng.

```
front_end/
├── src/
│   ├── components/
│   │   └── Common/
│   │       └── Button.jsx
│   ├── hooks/
│   │   └── useUsers.js
│   └── pages/
│       ├── admin/
│       ├── renter/
│       └── shared/
│           └── RegisterPage.jsx
│
├── tests/  <-- TOÀN BỘ TEST NẰM Ở ĐÂY
│   ├── components/
│   │   └── Common/
│   │       └── Button.test.jsx
│   ├── hooks/
│   │   └── (Tùy chọn, nếu bạn test hook)
│   └── pages/
│       ├── admin/
│       ├── renter/
│       └── shared/
│           └── RegisterPage.test.jsx  <-- File test cho RegisterPage
│
├── vitest.config.js
└── package.json
```

## 6\. 🎭 Nguyên tắc Mocking (Cách Test Hoạt động)

[cite\_start]Một yêu cầu bắt buộc của Unit Test là **sự cô lập (Isolation)**[cite: 17, 18, 129]. Component `RegisterPage` phải được test mà không phụ thuộc vào API thật, router thật, hay hook thật.

Chúng ta sử dụng `vi.mock()` của Vitest để "giả lập" các dependencies này.

**Ví dụ (Mock `useUsers` trong `RegisterPage.test.jsx`):**

Thay vì để `RegisterPage` gọi `useUsers.js` (file gọi API thật), chúng ta ra lệnh cho Vitest:

```javascript
// Trong file: tests/pages/shared/RegisterPage.test.jsx

// (Giả lập hook useUsers)
const mockRegisterUser = vi.fn(); // Tạo 1 hàm gián điệp
vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => ({
    registerUser: mockRegisterUser // Trả về hàm gián điệp của chúng ta
  })
}));

// (Giả lập hook useNavigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')), // Giữ lại các hàm thật (như Link)
  useNavigate: () => mockNavigate // Thay thế useNavigate
}));
```

Bằng cách này, trong file test, chúng ta có thể:

1.  **Kiểm soát đầu vào:** `mockRegisterUser.mockResolvedValue({ success: true });` (Giả lập API thành công)
2.  **Kiểm soát lỗi:** `mockRegisterUser.mockRejectedValue(new Error('Email exists'));` (Giả lập API thất bại)
3.  **Kiểm tra hành vi:** `expect(mockRegisterUser).toHaveBeenCalledWith(...)` (Kiểm tra xem hàm có được gọi với đúng dữ liệu không).