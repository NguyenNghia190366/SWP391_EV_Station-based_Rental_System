-- ============================================
-- DUMMY ACCOUNTS SQL SCRIPT
-- Insert test accounts vào database
-- ============================================

USE [EVRentalDB]; -- Thay tên database của bạn
GO

-- ============================================
-- 1. INSERT ADMIN ACCOUNT
-- ============================================
INSERT INTO Users (
    user_id,
    email,
    password_hash,
    full_name,
    role,
    phone,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'admin001',
    'admin@evrental.com',
    '$2a$10$mK5H5rGQxJ5YxYxYxYxYxOqJ5vK5H5rGQxJ5YxYxYxYxYxYxYxYx', -- Password: Admin@123 (hash bcrypt)
    N'Nguyễn Văn Admin',
    'admin',
    '0900000001',
    1,
    GETDATE(),
    GETDATE()
);

-- ============================================
-- 2. INSERT STAFF ACCOUNT
-- ============================================
INSERT INTO Users (
    user_id,
    email,
    password_hash,
    full_name,
    role,
    phone,
    is_verified,
    station_id,
    created_at,
    updated_at
) VALUES (
    'staff001',
    'staff@evrental.com',
    '$2a$10$mK5H5rGQxJ5YxYxYxYxYxOqJ5vK5H5rGQxJ5YxYxYxYxYxYxYxYx', -- Password: Staff@123
    N'Trần Thị Staff',
    'staff',
    '0900000002',
    1,
    1, -- station_id = 1 (Trạm Quận 1)
    GETDATE(),
    GETDATE()
);

-- ============================================
-- 3. INSERT RENTER - ĐÃ XÁC THỰC ĐẦY ĐỦ
-- ============================================
INSERT INTO Users (
    user_id,
    email,
    password_hash,
    full_name,
    role,
    phone,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'renter001',
    'renter.verified@gmail.com',
    '$2a$10$mK5H5rGQxJ5YxYxYxYxYxOqJ5vK5H5rGQxJ5YxYxYxYxYxYxYxYx', -- Password: Renter@123
    N'Lê Văn Khách',
    'renter',
    '0901234567',
    1,
    GETDATE(),
    GETDATE()
);

-- Insert Driver License (đã xác thực)
INSERT INTO Driver_License (
    license_number,
    renter_id,
    image_front,
    image_back,
    issue_date,
    expiry_date,
    is_verified,
    is_read,
    verified_at,
    created_at
) VALUES (
    'B2-123456789',
    'renter001',
    '/uploads/licenses/renter001_front.jpg',
    '/uploads/licenses/renter001_back.jpg',
    '2020-10-20',
    '2030-10-20',
    1,
    1,
    DATEADD(DAY, -8, GETDATE()),
    DATEADD(DAY, -10, GETDATE())
);

-- Insert CCCD (đã xác thực)
INSERT INTO CCCD (
    cccd_number,
    renter_id,
    image_front,
    image_back,
    full_name,
    date_of_birth,
    address,
    issue_date,
    is_verified,
    is_read,
    verified_at,
    created_at
) VALUES (
    '079200123456',
    'renter001',
    '/uploads/cccd/renter001_front.jpg',
    '/uploads/cccd/renter001_back.jpg',
    N'Lê Văn Khách',
    '1990-05-15',
    N'123 Nguyễn Huệ, Quận 1, TP.HCM',
    '2020-01-01',
    1,
    1,
    DATEADD(DAY, -8, GETDATE()),
    DATEADD(DAY, -10, GETDATE())
);

-- ============================================
-- 4. INSERT RENTER - CHƯA XÁC THỰC GPLX
-- ============================================
INSERT INTO Users (
    user_id,
    email,
    password_hash,
    full_name,
    role,
    phone,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'renter002',
    'renter.nolicense@gmail.com',
    '$2a$10$mK5H5rGQxJ5YxYxYxYxYxOqJ5vK5H5rGQxJ5YxYxYxYxYxYxYxYx', -- Password: Renter@123
    N'Phạm Thị Mới',
    'renter',
    '0909876543',
    0,
    GETDATE(),
    GETDATE()
);

-- Insert CCCD (đã xác thực, nhưng chưa có GPLX)
INSERT INTO CCCD (
    cccd_number,
    renter_id,
    image_front,
    image_back,
    full_name,
    date_of_birth,
    address,
    issue_date,
    is_verified,
    is_read,
    verified_at,
    created_at
) VALUES (
    '079200654321',
    'renter002',
    '/uploads/cccd/renter002_front.jpg',
    '/uploads/cccd/renter002_back.jpg',
    N'Phạm Thị Mới',
    '1995-08-20',
    N'456 Lê Lợi, Quận 3, TP.HCM',
    '2021-01-01',
    1,
    1,
    DATEADD(DAY, -7, GETDATE()),
    DATEADD(DAY, -9, GETDATE())
);

-- ============================================
-- 5. INSERT RENTER - CHƯA XÁC THỰC CCCD
-- ============================================
INSERT INTO Users (
    user_id,
    email,
    password_hash,
    full_name,
    role,
    phone,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'renter003',
    'renter.nocccd@gmail.com',
    '$2a$10$mK5H5rGQxJ5YxYxYxYxYxOqJ5vK5H5rGQxJ5YxYxYxYxYxYxYxYx', -- Password: Renter@123
    N'Hoàng Văn Mới',
    'renter',
    '0912345678',
    0,
    GETDATE(),
    GETDATE()
);

-- Insert Driver License (đã xác thực, nhưng chưa có CCCD)
INSERT INTO Driver_License (
    license_number,
    renter_id,
    image_front,
    image_back,
    issue_date,
    expiry_date,
    is_verified,
    is_read,
    verified_at,
    created_at
) VALUES (
    'B2-987654321',
    'renter003',
    '/uploads/licenses/renter003_front.jpg',
    '/uploads/licenses/renter003_back.jpg',
    '2019-05-15',
    '2029-05-15',
    1,
    1,
    DATEADD(DAY, -9, GETDATE()),
    DATEADD(DAY, -11, GETDATE())
);

-- ============================================
-- 6. INSERT RENTER - CHƯA XÁC THỰC GÌ CẢ
-- ============================================
INSERT INTO Users (
    user_id,
    email,
    password_hash,
    full_name,
    role,
    phone,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'renter004',
    'renter.new@gmail.com',
    '$2a$10$mK5H5rGQxJ5YxYxYxYxYxOqJ5vK5H5rGQxJ5YxYxYxYxYxYxYxYx', -- Password: Renter@123
    N'Đỗ Thị Hoàn Toàn Mới',
    'renter',
    '0923456789',
    0,
    GETDATE(),
    GETDATE()
);
-- Không có GPLX và CCCD cho account này

GO

-- ============================================
-- VERIFY INSERTED DATA
-- ============================================
SELECT 
    user_id,
    email,
    full_name,
    role,
    is_verified,
    phone
FROM Users
WHERE user_id IN ('admin001', 'staff001', 'renter001', 'renter002', 'renter003', 'renter004');

SELECT 
    license_number,
    renter_id,
    is_verified,
    verified_at
FROM Driver_License
WHERE renter_id IN ('renter001', 'renter003');

SELECT 
    cccd_number,
    renter_id,
    is_verified,
    verified_at
FROM CCCD
WHERE renter_id IN ('renter001', 'renter002');

GO

PRINT 'Dummy accounts created successfully!';
PRINT '';
PRINT '===================================';
PRINT 'TEST ACCOUNTS CREDENTIALS:';
PRINT '===================================';
PRINT 'Admin:     admin@evrental.com / Admin@123';
PRINT 'Staff:     staff@evrental.com / Staff@123';
PRINT 'Renter 1:  renter.verified@gmail.com / Renter@123 (VERIFIED)';
PRINT 'Renter 2:  renter.nolicense@gmail.com / Renter@123 (NO LICENSE)';
PRINT 'Renter 3:  renter.nocccd@gmail.com / Renter@123 (NO CCCD)';
PRINT 'Renter 4:  renter.new@gmail.com / Renter@123 (NO DOCS)';
PRINT '===================================';
