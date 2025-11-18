# SWP391_EV_Station-based_Rental_System — Codebase Summary

This document summarizes the main files and functions in the project. It focuses on the frontend (`front_end/`) and backend (`back_end/`) key files and provides an analysis of why creating a rental order might fail, and recommended fixes.

---

## Frontend (front_end/)

### top-level: src/
- `main.jsx` — app entry, mounts `<App />` inside BrowserRouter.
- `App.jsx` — top-level routes and base layout.

### `src/hooks/` — hooks for API + domain logic
- `useAxiosInstance.js` — creates axios instance with base URL, token header and interceptors.
- `useAPI.js` — wrapper for API requests (common methods) (if present).
- `useRenters.js` — functions to manage renter CRUD & details.
- `useRentalOrders.js` — core booking hook. Contains:
  - `getRentalOrdersByRenterId(renterId)` — GET orders by renter.
  - `createRentalOrder(orderData)` — POST `/RentalOrders` (creates booking). Contains logging and detailed error handling.
  - `approveRentalOrder(orderId, orderData)` — PUT `/RentalOrders/{id}` to set status `APPROVED`.
  - `handOverOrder(orderId)` — PUT `/Inuse?id={id}`, set `IN_USE`.
  - `handOverReturnOrder(orderId)` — PUT `/Complete?id={id}`, set `COMPLETED`.
  - `rejectRentalOrder(orderId, orderData)` — PUT `/api/RentalOrders/{id}` set `REJECTED`.
  - `updateRentalOrderStatus(orderId, status, orderData)` — generic update.

- `usePayment.js` — handles payment logic (VNPay):
  - `createPayment(orderId, amount, ...)` — POST `vnpay/create-payment`.
  - `createRefund()` — POST `vnpay/create-refund`.
  - `updateOrderStatusToInUse(orderId)` — update order after payment.

- `useVehicles`, `useStations`, `useUsers` etc. — are similar domain hooks; they expose CRUD and helper functions for each domain resource.

### `src/pages/` — UI pages
- `renter/Booking/BookingFormPage.jsx` — front-end booking form. Key functions:
  - `handleSubmit(values)` — gathers form values, validates with `yup`, prepares the `orderData`, and calls `createRentalOrder(orderData)`.
  - `getById(vehicleId)` — fetch vehicle info for display and validation.

- `renter/ContractOnlinePage.jsx` — displays an online version of the rental contract and payment pane. Handles:
  - `handleCccdSubmit`, `handleLicenseSubmit` — uploading CCCD and license images via cloudinary and backend hooks
  - `handleSubmitPayment` — create payment, redirect to VNPay

- `renter/VerifyPage.jsx` — renter verification flow: forms to upload CCCD and license images. Uses cloudinary upload helper.
- `renter/payment/PaymentPage.jsx` — redirects to payment or shows spinner; included VNPay logic.
- `renter/RentalHistoryPage.jsx` — shows rental history and actions.

- `staff/Booking/BookingTable.jsx` — the admin/staff booking table listing for staff actions: approve/reject, create contract actions.
- `staff/StaffContractOnlinePage.jsx` — staff-facing contract online UI which can send contract to renter, sign, etc.

### `src/components` & `src/pages/*`
- UI components and smaller helper pages, not exhaustively listed; file names indicate functionality.

---

## Backend (back_end/)

### Controllers
- `RentalOrdersController.cs`
  - `GetRentalOrders()`, `GetRentalOrder(id)` — GET endpoints
  - `PostRentalOrder(OrderMakingDto)` — `POST /api/RentalOrders` — creates a booking with server validations:
    - Validates vehicle exists and `vehicle.IsAvailable` is true.
    - `StartTime >= DateTime.UtcNow` (Start time cannot be in the past UTC).
    - `StartTime < EndTime`.
  - PUT endpoints to update order status (`/Inuse`, `/Complete`, `/Reject`, `/Approve`), and generic `PUT: api/RentalOrders/{id}`.

- `PaymentsController.cs` — handles VNPay integration. Key endpoints:
  - `POST /api/vnpay` — returns VNPay URL or redirects
  - `GET /api/vnpay` — handle return actions.

- `VehiclesController.cs`, `UsersController.cs`, `RentersController.cs`, etc. — standard CRUD for domain entities.

---

## Why rental order creation might fail
Below are possible causes, with steps to diagnose and recommended fixes.

### 1) Vehicle not available
- Backend check: if `vehicle.IsAvailable` is `false`, POST returns `400 Bad Request`.
- Reproduction: When user tries to book a vehicle that is already in use or marked unavailable, POST will fail.
- Debugging steps:
  - Inspect `GET /api/Vehicles/{vehicleId}` and check `isAvailable`/`IsAvailable`.
  - Inspect `GET /api/RentalOrders?renter_id={id}` to see if a booking already exists for same vehicle/time.
- Fixes:
  - Add a client-side check in `BookingFormPage.handleSubmit` to fetch vehicle info and `toast.warn` if `isAvailable` is false.
  - Check overlap detection (see section 3 below).

### 2) Start date/time is in the past (UTC mismatch)
- Backend check: `StartTime.CompareTo(DateTime.UtcNow) < 0` -> `BadRequest`.
- Frontend DatePicker uses date only (no time). If you send `values.startDate.toISOString()` with midnight in local time, depending on timezone this may be earlier than `DateTime.UtcNow`.
- Debugging steps:
  - Open network tab and inspect the POST payload's `startTime`/`endTime` vs `DateTime.UtcNow` (server time). If startTime < now (by UTC) it triggers `BadRequest`.
  - Reproduce by setting start date to today and see if the server rejects.
- Fixes:
  - On the client, set startTime to: if user picks today, use current time (dayjs()) rather than midnight, or set startTime to `dayjs(values.startDate).startOf('day').add(1, 'minute')` or similar so that startTime > now in UTC.
  - Add a quick on-client validation before submit: `if (startTime < nowUTC) { toast.warn('Ngày bắt đầu phải là ngày hôm nay hoặc sau bây giờ'); return; }`.

### 3) StartTime >= EndTime
- Backend rejects if StartTime >= EndTime.
- Debugging: ensure `startDate` < `endDate`. The existing `yup` validation checks this client-side, but ensure the Date objects pass to server endTime > startTime.
- Fix: the existing validation is present; ensure `DatePicker` timezone conversion does not cause endTime to be earlier.

### 4) Duplicate / Overlapping booking or reserved vehicle
- Although the backend's `PostRentalOrder` does not check for overlapping bookings explicitly, there are other ways duplicate bookings can be prevented:
  - The backend may set `vehicle.IsAvailable` false on another booking and prevent creation.
  - If the renter already has a booking for the same vehicle and overlapping time, this may be prevented by an extra check on the server or by vehicle availability flag.
- Debugging:
  - Check `GET /api/RentalOrders?renter_id={renterId}`: look for any existing orders with `status` equal to `APPROVED`, `IN_USE`, or `PENDING_HANDOVER` that overlap with the new dates.
  - Check `GET /api/Vehicles/{id}` for availability.
- Fix (frontend):
  - Before creating a booking, call `getRentalOrdersByRenterId` for current renter and check for overlapping bookings using overlap logic:
    - Overlap check: `existing.Start < newEnd && newStart < existing.End` indicates an overlap.
  - Show a friendly `toast.warn` like: `Bạn đã có đặt trước trong khung thời gian này. Kiểm tra lịch sử đặt xe hoặc chọn ngày khác.`

### 5) Missing required fields or validation fails server side
- Backend requires `RenterId`, `VehicleId`, `StartTime`, etc. If any value is missing or invalid, the backend can return `400`.
- Debugging:
  - Check Network tab, look at request body to ensure required fields are there and valid.
  - If server returns a validation message, display it to users (toast). The frontend already logs and shows it.

## Example client-side checks to add (BookingFormPage.jsx)
Add these checks inside `handleSubmit` before calling `createRentalOrder`:

```javascript
// 1) Ensure vehicle exists and is available
const vehicleData = await getById(vehicleId);
if (!vehicleData || vehicleData.isAvailable === false) {
  toast.warn('Xe hiện không có sẵn.');
  return;
}

// 2) Normalize and ensure startTime > now UTC
let startTime = values.startDate;
let endTime = values.endDate;
// if user chose today, set startTime to now (or at least now + 1 minute)
if (dayjs().isSame(startTime, 'day')) {
  startTime = dayjs();
}
const startUtc = startTime.toISOString();
const endUtc = endTime.toISOString();

if (dayjs(startUtc).isBefore(dayjs())) {
  toast.warn('Ngày bắt đầu phải là ngày/h thời điểm hiện tại.');
  return;
}

// 3) Check overlap with existing orders
const existingOrders = await getRentalOrdersByRenterId(renterId);
const overlap = existingOrders.some(o => {
  const s = dayjs(o.startTime);
  const e = dayjs(o.endTime);
  return s.isBefore(dayjs(endUtc)) && dayjs(startUtc).isBefore(e);
});
if (overlap) {
  toast.warn('Bạn đã có  một đặt trước trong khung này.');
  return;
}

// 4) Now call createRentalOrder with proper startTime/endTime
const orderData = {..., startTime: startUtc, endTime: endUtc}
await createRentalOrder(orderData);
```

## Recommended UI messaging
- Show returned error message from API to help the user.
- Use `toast.error(...)` with backend message details and include a “View my bookings” CTA.

---

## Final notes
- The backend validation for rental order creation is simple and strict — a 400 is intentionally used for safety (invalid request or unavailable vehicle). The common causes are time (UTC) mismatch, vehicle availability, or time overlap with existing bookings.
- Implementing the client-side checks above will reduce user friction and reduce backend 400 errors.

If you'd like, I can implement the suggested client-side checks in `BookingFormPage.jsx` and also ensure the create call returns a toast showing the server message on error — or create a PR with these changes.
