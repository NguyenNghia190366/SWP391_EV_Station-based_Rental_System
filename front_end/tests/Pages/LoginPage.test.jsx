// File: front_end/tests/Pages/LoginPage.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage from '../../src/Components/Common/Pages/LoginPage.jsx'; // Sửa đường dẫn này nếu file của bạn ở chỗ khác

// --- (Phần 1: Mocking) ---
// vi.hoisted là cách làm chính xác để fix lỗi hoisting
// ĐỊNH NGHĨA TẤT CẢ BIẾN MOCK Ở ĐÂY
const {
    mockLoginUser,
    mockApiGet,
    mockApiPost,
    mockNavigate,
    mockToastSuccess,
    mockToastError,
    mockMessageSuccess,
    mockMessageError,
    mockLocalStorageSetItem,
} = vi.hoisted(() => {
    return {
        mockLoginUser: vi.fn(),
        mockApiGet: vi.fn(),
        mockApiPost: vi.fn(),
        mockNavigate: vi.fn(),
        mockToastSuccess: vi.fn(),
        mockToastError: vi.fn(),
        mockMessageSuccess: vi.fn(),
        mockMessageError: vi.fn(),
        mockLocalStorageSetItem: vi.fn(), // Spy cho localStorage
    };
});

// Mock các dependencies (Dùng các biến đã hoisted ở trên)
vi.mock('@/hooks/useUsers', () => ({
    useUsers: () => ({ loginUser: mockLoginUser }),
}));

// Mock useAxiosInstance trả về cả get và post
vi.mock('@/hooks/useAxiosInstance', () => ({
    useAxiosInstance: () => ({
        get: mockApiGet,
        post: mockApiPost,
    }),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockNavigate,
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: mockToastSuccess,
        error: mockToastError,
    },
    ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock AntD (Chỉ mock 'message')
vi.mock('antd', async () => {
    const antd = await vi.importActual('antd');
    return {
        ...antd, // Giữ lại <ConfigProvider>, <Form>, <Input>...
        message: { // GHI ĐÈ 'message'
            success: mockMessageSuccess,
            error: mockMessageError,
            config: vi.fn(), // Mock hàm config
        },
    };
});

// Mock component GoogleSignIn (biến nó thành 1 nút button)
vi.mock('../../src/Pages/GoogleSignIn', () => ({
    default: (props) => (
        <button
            data-testid="mock-google-signin"
            onClick={() => props.onCredential('mock-google-token-123')}
        >
            Google Sign In
        </button>
    ),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
            // Dùng "spy" (gián điệp) để chúng ta có thể check (expect)
            mockLocalStorageSetItem(key, value);
        },
        clear: () => {
            store = {};
        },
        removeItem: (key) => {
            delete store[key];
        },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper render
const renderComponent = () => {
    render(
        <ConfigProvider>
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/home" element={<div>Trang Home</div>} />
                    <Route path="/admin/dashboard" element={<div>Trang Admin</div>} />
                    <Route path="/staff/dashboard" element={<div>Trang Staff</div>} />
                </Routes>
            </MemoryRouter>
        </ConfigProvider>
    );
};

// --- (Phần 2: Test Cases) ---
describe('LoginPage', () => {
    const user = userEvent.setup({ delay: null });

    beforeEach(() => {
        vi.clearAllMocks(); // Clear tất cả mock
        vi.useRealTimers();  // Đảm bảo dùng đồng hồ thật (cho các test async)
    });

    // Helper điền form
    const fillValidForm = async () => {
        await user.type(screen.getByPlaceholderText('Email của bạn'), 'test@example.com');
        await user.type(screen.getByPlaceholderText('Mật khẩu'), 'password123');
    };

    // Test 1: Render
    test('should render form fields and buttons', () => {
        renderComponent();
        expect(screen.getByPlaceholderText('Email của bạn')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
        expect(screen.getByTestId('mock-google-signin')).toBeInTheDocument();
        expect(screen.getByText(/Quên mật khẩu?/i)).toBeInTheDocument();
        expect(screen.getByText(/Đăng ký/i)).toBeInTheDocument();
    });

    // Test 2: Validation Rỗng (dùng 10s timeout cho an toàn)
    test('should show validation errors when submitting with empty fields', async () => {
        renderComponent();
        await user.click(screen.getByRole('button', { name: /Đăng nhập/i }));

        expect(await screen.findByText('Vui lòng nhập email!')).toBeInTheDocument();
        expect(await screen.findByText('Vui lòng nhập mật khẩu!')).toBeInTheDocument();
        expect(mockLoginUser).not.toHaveBeenCalled();
    }, 10000);

    // Test 3: Lỗi Sai Mật khẩu (API Fail)
    test('should show error message for invalid credentials (401)', async () => {
        // Giả lập API trả về lỗi 401
        mockLoginUser.mockRejectedValue(new Error('401 Unauthorized'));
        renderComponent();
        await fillValidForm();

        await user.click(screen.getByRole('button', { name: /Đăng nhập/i }));

        // Chờ toast lỗi xuất hiện
        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalledWith('Email hoặc mật khẩu không chính xác.', expect.anything());
        });
        // Chờ Alert lỗi (trong form) xuất hiện
        expect(await screen.findByText('Email hoặc mật khẩu không chính xác.')).toBeInTheDocument();
        expect(mockLocalStorageSetItem).not.toHaveBeenCalled();
    }, 10000);

    // Test 4: Happy Path (RENTER) - Cần 2 API calls và Timers
    test('should login as RENTER, fetch renterId, and navigate to /home', async () => {
        vi.useFakeTimers(); // Bật timer giả

        // Giả lập API 1 (Login)
        const mockUser = { user_id: 10, email: 'renter@test.com', fullName: 'Test Renter', role: 'RENTER' };
        mockLoginUser.mockResolvedValue({ token: 'abc123', user: mockUser });

        // Giả lập API 2 (Get Renter)
        const mockRenter = { user_id: 10, renter_id: 99 };
        mockApiGet.mockResolvedValue({ data: { data: [mockRenter] } });

        renderComponent();
        await fillValidForm();
        await user.click(screen.getByRole('button', { name: /Đăng nhập/i }));

        // Chờ API 1 (Login) được gọi
        await waitFor(() => expect(mockLoginUser).toHaveBeenCalled());
        // Chờ API 2 (Get Renter) được gọi
        await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/Renters', expect.anything()));

        // Kiểm tra localStorage
        expect(mockLocalStorageSetItem).toHaveBeenCalledWith('token', 'abc123');
        expect(mockLocalStorageSetItem).toHaveBeenCalledWith('role', 'RENTER');
        expect(mockLocalStorageSetItem).toHaveBeenCalledWith('userId', 10);
        expect(mockLocalStorageSetItem).toHaveBeenCalledWith('renterId', 99);

        // Kiểm tra Toast (chỉ check 1 phần)
        await waitFor(() => {
            expect(mockToastSuccess).toHaveBeenCalledWith(
                expect.stringContaining('Test Renter'),
                expect.anything()
            );
        });

        // Tua nhanh 1.5s
        vi.advanceTimersByTime(2000);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });

        vi.useRealTimers();
    }, 10000);

    // Test 5: Happy Path (ADMIN) - Chỉ cần 1 API call
    test('should login as ADMIN and navigate to /admin/dashboard', async () => {
        vi.useFakeTimers(); // Bật timer giả

        // Giả lập API 1 (Login)
        const mockUser = { user_id: 1, email: 'admin@test.com', fullName: 'Test Admin', role: 'ADMIN' };
        mockLoginUser.mockResolvedValue({ token: 'xyz789', user: mockUser });

        renderComponent();
        await fillValidForm();
        await user.click(screen.getByRole('button', { name: /Đăng nhập/i }));

        // Chờ API 1 (Login) được gọi
        await waitFor(() => expect(mockLoginUser).toHaveBeenCalled());
        // Đảm bảo API 2 (Get Renter) KHÔNG được gọi
        expect(mockApiGet).not.toHaveBeenCalled();

        // Kiểm tra localStorage
        expect(mockLocalStorageSetItem).toHaveBeenCalledWith('role', 'ADMIN');

        // Tua nhanh 1.5s
        vi.advanceTimersByTime(2000);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
        });

        vi.useRealTimers();
    }, 10000);

    // Test 6: Google Login
    test('should handle Google Sign-In successfully and navigate', async () => {
        vi.useFakeTimers(); // Bật timer giả

        // Giả lập API 1 (Google Login)
        const mockUser = { user_id: 20, email: 'google@test.com', fullName: 'Google User', role: 'RENTER' };
        mockApiPost.mockResolvedValue({ data: { token: 'google-token', user: mockUser } });

        // Giả lập API 2 (Get Renter)
        const mockRenter = { user_id: 20, renter_id: 100 };
        mockApiGet.mockResolvedValue({ data: { data: [mockRenter] } });

        renderComponent();

        // Click vào nút Google (mock)
        await user.click(screen.getByTestId('mock-google-signin'));

        // Chờ API 1 (Google Login) được gọi
        await waitFor(() => {
            expect(mockApiPost).toHaveBeenCalledWith('/UserAccount/google-login', { idToken: 'mock-google-token-123' });
        });
        // Chờ API 2 (Get Renter) được gọi
        await waitFor(() => expect(mockApiGet).toHaveBeenCalled());

        // Kiểm tra localStorage
        expect(mockLocalStorageSetItem).toHaveBeenCalledWith('renterId', 100);

        // Tua nhanh 1.5s
        vi.advanceTimersByTime(2000);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });

        vi.useRealTimers();
    }, 10000);

});