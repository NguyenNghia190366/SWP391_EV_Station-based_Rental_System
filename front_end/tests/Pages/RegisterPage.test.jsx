// File: front_end/tests/Pages/RegisterPage.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import RegisterPage from '../../src/Components/Common/Pages/RegisterPage.jsx';

// --- (Phần 1: Mocking) ---
// vi.hoisted là cách làm chính xác để fix lỗi hoisting
// ĐỊNH NGHĨA TẤT CẢ BIẾN MOCK Ở ĐÂY
const {
  mockRegisterUser,
  mockNavigate,
  mockToastSuccess,
  mockMessageSuccess,
  mockMessageError,
} = vi.hoisted(() => {
  return {
    mockRegisterUser: vi.fn(),
    mockNavigate: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockMessageSuccess: vi.fn(),
    mockMessageError: vi.fn(),
  };
});

// Mock các dependencies (Dùng các biến đã hoisted ở trên)
vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => ({ registerUser: mockRegisterUser }),
}));

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

vi.mock('react-toastify', () => ({
  toast: { success: mockToastSuccess },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock AntD (Message và DatePicker)
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd');
  const React = await vi.importActual('react');
  const dayjsMod = await vi.importActual('dayjs');
  const dayjs = dayjsMod.default || dayjsMod;

  // Controlled input để Form/Yup luôn "nhận" giá trị ổn định
  const MockDatePicker = (props) => {
    const [val, setVal] = React.useState('');
    return React.createElement('input', {
      placeholder: props.placeholder || 'DatePicker',
      'aria-label': props.placeholder || 'DatePicker',
      value: val,
      onChange: (e) => {
        const v = e.target.value;
        setVal(v);
        // Trả đúng signature (date, dateString) = (dayjs(v), v)
        props.onChange?.(dayjs(v), v);
      },
      'data-testid': 'mock-datepicker',
    });
  };

  return {
    ...antd,
    message: {
      success: mockMessageSuccess,
      error: mockMessageError,
    },
    DatePicker: MockDatePicker,
  };
});

// Helper render
const renderComponent = () => {
  render(
    <ConfigProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div>Trang Đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </ConfigProvider>
  );
};

// --- (Phần 2: Test Cases) ---
describe('RegisterPage', () => {
  // Dùng userEvent.setup({ delay: null }) sẽ gõ phím nhanh hơn, test nhanh hơn
  const user = userEvent.setup({ delay: null });

  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers(); // Đảm bảo reset timer sau mỗi test
  });

  // Helper điền form (DRY)
  const fillValidForm = async () => {
    await user.type(screen.getByPlaceholderText('Họ và tên'), 'Test User');
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Số điện thoại'), '0987654321');
    await user.type(screen.getByPlaceholderText('Địa chỉ'), '123 Đường Test, Quận 1');
    await user.type(screen.getByPlaceholderText('Mật khẩu'), 'password123');
    await user.type(screen.getByPlaceholderText('Xác nhận mật khẩu'), 'password123');
    // Gõ vào DatePicker (đã bị mock thành input)
    const dateInput = screen.getByPlaceholderText('Ngày sinh');
    await user.type(dateInput, '2000-01-01'); // Dùng YYYY-MM-DD
    fireEvent.blur(dateInput); // Bắt buộc blur để AntD Form nhận giá trị
  };

  // Test 1: Render
  test('should render all form fields and submit button', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('Họ và tên')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ngày sinh')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng ký/i })).toBeInTheDocument();
  });

  // Test 2: Validation Rỗng
  test('should display validation errors when submitting with empty fields', async () => {
    renderComponent();
    await user.click(screen.getByRole('button', { name: /Đăng ký/i }));

    expect(await screen.findByText('Vui lòng nhập họ tên!')).toBeInTheDocument();
    expect(await screen.findByText('Vui lòng nhập email!')).toBeInTheDocument();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  // Test 3: Validation Mật khẩu không khớp
  test('should display validation error for password mismatch', async () => {
    renderComponent();

    // Điền form hợp lệ (trừ mật khẩu)
    await user.type(screen.getByPlaceholderText('Họ và tên'), 'Test User');
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Số điện thoại'), '0987654321');
    await user.type(screen.getByPlaceholderText('Địa chỉ'), '123 Đường Test, Quận 1');
    await user.type(screen.getByPlaceholderText('Ngày sinh'), '2000-01-01');

    // Cố tình mismatch
    await user.type(screen.getByPlaceholderText('Mật khẩu'), 'password123');
    await user.type(screen.getByPlaceholderText('Xác nhận mật khẩu'), 'wrong-confirm');

    await user.click(screen.getByRole('button', { name: /Đăng ký/i }));

    expect(await screen.findByText(/Mật khẩu không khớp/i)).toBeInTheDocument();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  }, 10000);

  // Test 4: Happy Path (Thành công)
  test('should submit successfully, show success messages, and navigate', async () => {
    // ⭐️ SỬA LỖI: KHÔNG bật fake timers ở đây
    mockRegisterUser.mockResolvedValue(true); 
    renderComponent();

    // Dùng fireEvent.change (sync) để điền form
    fireEvent.change(screen.getByPlaceholderText('Họ và tên'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Số điện thoại'), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByPlaceholderText('Địa chỉ'), { target: { value: '123 Đường Test, Quận 1' } });
    fireEvent.change(screen.getByPlaceholderText('Mật khẩu'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Xác nhận mật khẩu'), { target: { value: 'password123' } });
    
    const dateInput = screen.getByPlaceholderText('Ngày sinh');
    fireEvent.change(dateInput, { target: { value: '2000-01-01' } }); 
    fireEvent.blur(dateInput); 

    fireEvent.click(screen.getByRole('button', { name: /Đăng ký/i }));

    // Chờ cho API call (dùng real timers, sẽ PASS như Test 5)
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Test User',
          email: 'test@example.com',
          dateOfBirth: '2000-01-01', 
        })
      );
      expect(mockMessageSuccess).toHaveBeenCalledWith(
        '✅ Đăng ký thành công! Hãy đăng nhập để tiếp tục.'
      );
      expect(mockToastSuccess).toHaveBeenCalled();
    });

    // ⭐️ SỬA LỖI: BẬT fake timers LÚC NÀY
    vi.useFakeTimers();

    // Tua nhanh đồng hồ 2s (giờ nó sẽ hoạt động)
    vi.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    
    // afterEach sẽ tự động gọi vi.useRealTimers()
  }); // Vẫn giữ 10s cho an toàn

  // Test 5: Error Path (API Fail)
  test('should show error message when API call fails', async () => {
    mockRegisterUser.mockResolvedValue(false); // Giả lập API trả về false
    renderComponent();

    await fillValidForm();
    await user.click(screen.getByRole('button', { name: /Đăng ký/i }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled();
      expect(mockMessageError).toHaveBeenCalledWith(
        'Không thể tạo tài khoản, vui lòng thử lại!'
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  }, 10000);
});