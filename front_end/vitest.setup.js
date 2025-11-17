// Import các hàm "matchers" hữu ích (ví dụ: .toBeInTheDocument())
import '@testing-library/jest-dom';
// Mock window.matchMedia (cần thiết cho Ant Design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});