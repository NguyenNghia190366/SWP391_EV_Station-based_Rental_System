# Quy trình Xác thực Tài khoản - Renter & Admin

## 🎯 Workflow Tổng quan

### 1. **RENTER SIDE** - Upload Giấy tờ
```
Profile (/profile) 
  → Verify Tab (hoặc /verify)
    → Upload CCCD (Chưa xác thực)
    → Upload GPLX (Chưa xác thực)
    → Submit ✅
    → Status: "Chờ duyệt" ⏳
```

**Key Features:**
- ✅ Upload Cloudinary → Backend
- ✅ Kiểm tra từ chối (nếu bị reject) → hiện lý do → cho phép re-upload
- ✅ **Ngăn upload khi đã xác thực** - UI disabled, không cho gửi nữa
- ✅ Thấy status: 
  - 📤 "Chưa xác thực" (no file)
  - ⏳ "Chờ duyệt" (uploaded, waiting)
  - ❌ "Bị từ chối" (rejected with reason)
  - ✅ "Đã xác thực" (approved, view only)

---

### 2. **ADMIN SIDE** - Duyệt Giấy tờ
```
Admin Dashboard (/admin/verification)
  → View Renter List
    → Click "Xác thực" → Approved ✅
    → Click "Từ chối" + reason → Rejected ❌
    → System sends Email Notification
```

**Key Features:**
- ✅ Admin verify renter → Backend: `is_verified = 1`
- ✅ Admin reject + reason → Backend: `is_verified = 0, rejection_reason = "..."`
- ✅ **Email notification** sent to renter:
  - **APPROVED**: "Chúc mừng! Tài khoản của bạn đã được xác thực thành công."
  - **REJECTED**: "Yêu cầu xác thực bị từ chối.\nLý do: {reason}"

---

### 3. **RENTER RECEIVES NOTIFICATION**
```
Email arrives → User sees in inbox
```

When Renter logs in next time:
- System fetches `/Cccds` + `/DriverLicenses` 
- Checks `is_verified` flag + `rejection_reason`
- Auto-updates `/verify` page status

---

## 📁 Files Created/Updated

### NEW Files:
1. **VerifyProfilePage.jsx** - Main verify page (shows status + upload UI)
   - Location: `src/Components/renter/pages/VerifyProfilePage.jsx`
   - Shows: Status cards, upload sections (conditional), success state

2. **UploadCCCDSection.jsx** - CCCD upload component
   - Location: `src/Components/renter/components/UploadCCCDSection.jsx`
   - Features: File upload, CCCD number input, disabled state when pending

3. **UploadDriverLicenseSection.jsx** - Driver License upload component
   - Location: `src/Components/renter/components/UploadDriverLicenseSection.jsx`
   - Features: File upload, License number input, disabled state when pending

### UPDATED Files:
1. **App.jsx** - Add import + route for `/verify`
2. **VerifyRenterContainer.jsx** - Add email notifications on verify/reject
3. **useDriverLicense.js** - Add fallback logic for UPDATE on duplicate key
4. **useCccd.js** - Add fallback logic for UPDATE on duplicate key

---

## 🔒 Protection Mechanisms

### 1. **Frontend Upload Block**
```jsx
{isDisabled && (
  <div className="absolute inset-0 bg-gray-100 opacity-50">
    <p>Giấy tờ đang chờ xác thực. Vui lòng không tải lên lại.</p>
  </div>
)}
```
- Upload button: `disabled={isDisabled || cccdStatus.status === 'verified'}`
- Input fields: `disabled={isDisabled}`

### 2. **Status-based Rendering**
```javascript
if (bothVerified) {
  // Show "Đã xác thực" - Hide upload sections
  return <SuccessCard />
}

if (anyRejected) {
  // Show rejection reason + "Tải lại" button
  return <RejectionCard onReupload={handleReupload} />
}

if (anyPending) {
  // Show "Chờ duyệt" - Disable upload
  return <PendingCard disabled={true} />
}

// Not uploaded yet
return <UploadSections />
```

### 3. **Backend Duplicate Key Handling**
```javascript
// First attempt: POST /UploadBang
try {
  const res = await instance.post("/DriverLicenses/UploadBang", {...})
} catch (error) {
  if (error.message.includes("2627")) { // UNIQUE KEY violation
    // Second attempt: GET existing + PUT update
    const existing = cccds.find(c => c.renterId === id)
    await instance.put(`/Cccds/${existing.id}`, {...})
  }
}
```

---

## 📊 Status Flow Diagram

```
┌─────────────────┐
│  NO DOCUMENTS   │  (status: 'not_uploaded')
│   📤 Upload     │  → Can upload → Submit
└────────┬────────┘
         │
    [Submit CCCD/GPLX]
         ↓
┌─────────────────┐
│  PENDING        │  (status: 'pending')
│   ⏳ Chờ duyệt    │  → Upload disabled
│ (Waiting Admin) │  → Cannot re-upload
└────────┬────────┘
         │
    [Admin Decision]
         ↓
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│VERIFIED│ │REJECTED│  (status: 'rejected')
│✅ DONE │ │❌ Reason│  → Show reason
│No more │ │🔄Retry │  → Can re-upload
│upload  │ └────────┘
└────────┘
```

---

## 🔄 API Calls Timeline

### Renter Upload CCCD:
```
1. Frontend: POST /Cccds/UploadCanCuoc {renter_Id, cccd_url, cccd_number}
2. Backend: Create or Update CCCD record
3. Status: is_verified = NULL (pending)
```

### Admin Verify:
```
1. Admin: PUT /Renters/{id} {is_verified: 1}
2. Backend: Update renter.is_verified = 1
3. Frontend: POST /Notifications/SendEmail {email, subject, body}
4. Backend: Send "Xác thực thành công" email
```

### Admin Reject:
```
1. Admin: PUT /Renters/{id} {is_verified: 0, rejection_reason: "..."}
2. Backend: Update renter.is_verified = 0 + rejection_reason
3. Frontend: POST /Notifications/SendEmail {email, subject, body}
4. Backend: Send "Bị từ chối" email with reason
```

### Renter Login (Auto-fetch):
```
1. User login
2. System: GET /Cccds?renterId={id}
3. System: GET /DriverLicenses?renterId={id}
4. System: Check is_verified + rejection_reason
5. UI: Auto-update status cards
```

---

## ✨ User Experience

### Happy Path (Approved):
```
1. Renter uploads CCCD + GPLX → Status: "Chờ duyệt"
2. Admin verifies → Status: "Đã xác thực" ✅
3. Email arrives: "Xác thực thành công"
4. Renter refreshes page → Sees "Đã xác thực" ✅
5. Can now book vehicles without verification again
```

### Unhappy Path (Rejected):
```
1. Renter uploads CCCD (blurry photo) → Status: "Chờ duyệt"
2. Admin rejects + reason: "Ảnh không rõ" → Status: "Bị từ chối" ❌
3. Email arrives: "Bị từ chối - Ảnh không rõ"
4. Renter refreshes → Sees reason + "🔄 Tải lại CCCD" button
5. Click "Tải lại" → Upload new clear photo
6. Back to "Chờ duyệt" state → Wait for admin again
```

---

## 🎨 UI Components

### VerifyProfilePage Layout:
```
Header: "🔐 Xác thực tài khoản"
├─ Status Summary Card
│  ├─ Alert (Success/Error/Pending)
│  ├─ CCCD Status Card
│  │  ├─ Icon + Label
│  │  ├─ CCCD Number (if uploaded)
│  │  ├─ Rejection Reason (if rejected)
│  │  └─ Action Button (Re-upload or "Chờ duyệt")
│  └─ License Status Card (same as above)
├─ Upload Sections (only if not verified)
│  ├─ UploadCCCDSection
│  └─ UploadDriverLicenseSection
├─ Success Card (if both verified)
└─ Refresh Button + Info Cards
```

---

## 🚀 How to Test

### Test Upload (Renter):
```
1. Login as renter: cho@gmail.com / password
2. Navigate to /verify or /profile → Verify tab
3. Upload CCCD (file + number)
4. Check browser console for Cloudinary URL
5. Status should change to "Chờ duyệt"
```

### Test Admin Verification:
```
1. Login as admin: admin@gmail.com / password
2. Go to /admin/verification
3. Find renter "cho@gmail.com" in table
4. Click "Xác thực" button
5. Check if renter's /verify page status updated to "Đã xác thực" ✅
6. Check cho@gmail.com inbox for verification email
```

### Test Rejection:
```
1. Admin dashboard → Find another renter
2. Click "Từ chối" button
3. Enter reason: "Ảnh không rõ"
4. Modal closes → Status updated to "Bị từ chối"
5. Check email for rejection notification with reason
```

### Test Re-upload:
```
1. Login as rejected renter
2. Go to /verify
3. See reason card + "🔄 Tải lại CCCD" button
4. Click button → Upload new file
5. Status returns to "Chờ duyệt"
```
