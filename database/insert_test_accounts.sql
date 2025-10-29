-- ============================================
-- SIMPLE DUMMY ACCOUNTS INSERTION
-- Chạy script này để tạo test accounts
-- Backend sẽ hash password khi login
-- ============================================

-- ============================================
-- BƯỚC 1: Xóa test accounts cũ (nếu có)
-- ============================================
DELETE FROM Driver_License WHERE renter_id IN ('renter001', 'renter002', 'renter003', 'renter004');
DELETE FROM CCCD WHERE renter_id IN ('renter001', 'renter002', 'renter003', 'renter004');
DELETE FROM Users WHERE user_id IN ('admin001', 'staff001', 'renter001', 'renter002', 'renter003', 'renter004');
GO

-- ============================================
-- BƯỚC 2: Insert Users
-- ============================================

-- Admin Account
INSERT INTO Users (user_id, email, password, full_name, role, phone, is_verified, created_at)
VALUES ('admin001', 'admin@evrental.com', 'Admin@123', N'Nguyễn Văn Admin', 'admin', '0900000001', 1, GETDATE());

-- Staff Account
INSERT INTO Users (user_id, email, password, full_name, role, phone, is_verified, station_id, created_at)
VALUES ('staff001', 'staff@evrental.com', 'Staff@123', N'Trần Thị Staff', 'staff', '0900000002', 1, 1, GETDATE());

-- Renter 1: Đã xác thực đầy đủ
INSERT INTO Users (user_id, email, password, full_name, role, phone, is_verified, created_at)
VALUES ('renter001', 'renter.verified@gmail.com', 'Renter@123', N'Lê Văn Khách', 'renter', '0901234567', 1, GETDATE());

-- Renter 2: Chưa có GPLX
INSERT INTO Users (user_id, email, password, full_name, role, phone, is_verified, created_at)
VALUES ('renter002', 'renter.nolicense@gmail.com', 'Renter@123', N'Phạm Thị Mới', 'renter', '0909876543', 0, GETDATE());

-- Renter 3: Chưa có CCCD
INSERT INTO Users (user_id, email, password, full_name, role, phone, is_verified, created_at)
VALUES ('renter003', 'renter.nocccd@gmail.com', 'Renter@123', N'Hoàng Văn Mới', 'renter', '0912345678', 0, GETDATE());

-- Renter 4: Chưa xác thực gì
INSERT INTO Users (user_id, email, password, full_name, role, phone, is_verified, created_at)
VALUES ('renter004', 'renter.new@gmail.com', 'Renter@123', N'Đỗ Thị Hoàn Toàn Mới', 'renter', '0923456789', 0, GETDATE());

GO

-- ============================================
-- BƯỚC 3: Insert Driver Licenses
-- ============================================

-- Renter 1: GPLX đã xác thực
INSERT INTO Driver_License (
    license_number, renter_id, 
    image_front, image_back,
    issue_date, expiry_date,
    is_verified, is_read, verified_at, created_at
)
VALUES (
    'B2-123456789', 'renter001',
    '/uploads/licenses/renter001_front.jpg', '/uploads/licenses/renter001_back.jpg',
    '2020-10-20', '2030-10-20',
    1, 1, DATEADD(DAY, -8, GETDATE()), DATEADD(DAY, -10, GETDATE())
);

-- Renter 3: GPLX đã xác thực
INSERT INTO Driver_License (
    license_number, renter_id,
    image_front, image_back,
    issue_date, expiry_date,
    is_verified, is_read, verified_at, created_at
)
VALUES (
    'B2-987654321', 'renter003',
    '/uploads/licenses/renter003_front.jpg', '/uploads/licenses/renter003_back.jpg',
    '2019-05-15', '2029-05-15',
    1, 1, DATEADD(DAY, -9, GETDATE()), DATEADD(DAY, -11, GETDATE())
);

GO

-- ============================================
-- BƯỚC 4: Insert CCCD
-- ============================================

-- Renter 1: CCCD đã xác thực
INSERT INTO CCCD (
    cccd_number, renter_id,
    image_front, image_back,
    full_name, date_of_birth, address, issue_date,
    is_verified, is_read, verified_at, created_at
)
VALUES (
    '079200123456', 'renter001',
    '/uploads/cccd/renter001_front.jpg', '/uploads/cccd/renter001_back.jpg',
    N'Lê Văn Khách', '1990-05-15', N'123 Nguyễn Huệ, Quận 1, TP.HCM', '2020-01-01',
    1, 1, DATEADD(DAY, -8, GETDATE()), DATEADD(DAY, -10, GETDATE())
);

-- Renter 2: CCCD đã xác thực (nhưng chưa có GPLX)
INSERT INTO CCCD (
    cccd_number, renter_id,
    image_front, image_back,
    full_name, date_of_birth, address, issue_date,
    is_verified, is_read, verified_at, created_at
)
VALUES (
    '079200654321', 'renter002',
    '/uploads/cccd/renter002_front.jpg', '/uploads/cccd/renter002_back.jpg',
    N'Phạm Thị Mới', '1995-08-20', N'456 Lê Lợi, Quận 3, TP.HCM', '2021-01-01',
    1, 1, DATEADD(DAY, -7, GETDATE()), DATEADD(DAY, -9, GETDATE())
);

GO

-- ============================================
-- BƯỚC 5: Verify Data
-- ============================================
PRINT '========================================';
PRINT 'VERIFICATION RESULTS:';
PRINT '========================================';

-- Check Users
SELECT 
    user_id as [User ID],
    email as [Email],
    full_name as [Full Name],
    role as [Role],
    is_verified as [Verified],
    phone as [Phone]
FROM Users
WHERE user_id IN ('admin001', 'staff001', 'renter001', 'renter002', 'renter003', 'renter004')
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'staff' THEN 2 
        WHEN 'renter' THEN 3 
    END,
    user_id;

PRINT '';
PRINT 'Driver Licenses:';
SELECT 
    license_number as [License #],
    renter_id as [Renter],
    is_verified as [Verified],
    FORMAT(verified_at, 'yyyy-MM-dd') as [Verified Date]
FROM Driver_License
WHERE renter_id IN ('renter001', 'renter003');

PRINT '';
PRINT 'CCCD Records:';
SELECT 
    cccd_number as [CCCD #],
    renter_id as [Renter],
    is_verified as [Verified],
    FORMAT(verified_at, 'yyyy-MM-dd') as [Verified Date]
FROM CCCD
WHERE renter_id IN ('renter001', 'renter002');

PRINT '';
PRINT '========================================';
PRINT 'TEST ACCOUNTS READY!';
PRINT '========================================';
PRINT '';
PRINT 'Login Credentials:';
PRINT '- Admin:    admin@evrental.com / Admin@123';
PRINT '- Staff:    staff@evrental.com / Staff@123';
PRINT '- Renter 1: renter.verified@gmail.com / Renter@123 ✅ VERIFIED';
PRINT '- Renter 2: renter.nolicense@gmail.com / Renter@123 ⚠️ NO LICENSE';
PRINT '- Renter 3: renter.nocccd@gmail.com / Renter@123 ⚠️ NO CCCD';
PRINT '- Renter 4: renter.new@gmail.com / Renter@123 ❌ NO DOCS';
PRINT '========================================';

GO
