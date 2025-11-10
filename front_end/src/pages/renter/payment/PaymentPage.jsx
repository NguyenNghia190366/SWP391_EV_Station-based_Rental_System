import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const [contractData, setContractData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const pendingContract = localStorage.getItem("pendingContract");

    if (!pendingContract) {
      alert("Không tìm thấy thông tin hợp đồng!");
      navigate("/vehicles");
      return;
    }

    setContractData(JSON.parse(pendingContract));
  }, [navigate]);

  // ========== HANDLE PAYMENT COMPLETE ==========
  const handlePaymentComplete = async (paymentInfo) => {
    const finalBooking = {
      ...contractData,
      payment: paymentInfo,
      status: "payment_completed",
      bookingId: `BK-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(localStorage.getItem("myBookings") || "[]");
    existingBookings.push(finalBooking);
    localStorage.setItem("myBookings", JSON.stringify(existingBookings));

    const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
    allBookings.push(finalBooking);
    localStorage.setItem("allBookings", JSON.stringify(allBookings));

    localStorage.setItem("currentBooking", JSON.stringify(finalBooking));
    localStorage.removeItem("pendingBooking");
    localStorage.removeItem("pendingContract");

    navigate("/payment-success", { state: { booking: finalBooking } });
  };

  // ========== HANDLE PAYMENT PROCESS ==========
  const handlePayment = () => {
    if (!contractData) return;

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      handlePaymentComplete({
        method: paymentMethod,
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date().toISOString(),
        amount: contractData.totalPrice,
      });
    }, 2000);
  };

  const handleBack = () => {
    navigate(`/contract/${vehicleId}`);
  };

  if (!contractData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Đang tải thông tin thanh toán...</div>
      </div>
    );
  }

  const totalPrice = contractData.totalPrice || 0;
  const deposit = contractData.deposit || 0;
  const vehicle = contractData.vehicle || {};
  const bookingData = contractData.bookingData || {};
  const days = contractData.days || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            THANH TOÁN
          </h1>
          <p className="text-gray-600">Hoàn tất thanh toán để xác nhận đặt xe</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ======= Order Summary ======= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Thông tin đơn hàng
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={vehicle.image || "/placeholder-vehicle.png"}
                  alt={vehicle.name || "Vehicle"}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{vehicle.name || "N/A"}</h3>
                  <p className="text-gray-600">
                    {days} ngày × {vehicle.price || 0}k VNĐ
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tổng giá thuê:</span>
                  <span className="font-semibold text-gray-900">
                    {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Đặt cọc (30%):</span>
                  <span className="font-semibold text-orange-600">
                    {deposit.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4">
                  <span className="text-lg font-bold text-gray-900">TỔNG THANH TOÁN:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">⏰ Thời gian:</p>
                <p className="text-gray-700">
                  {bookingData.startDate
                    ? new Date(bookingData.startDate).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
                <p className="text-gray-500 text-center my-1">↓</p>
                <p className="text-gray-700">
                  {bookingData.endDate
                    ? new Date(bookingData.endDate).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">
                  📍 Nhận xe tại:{" "}
                  <span className="text-purple-600">{bookingData.pickupLocation || "N/A"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ======= Payment Methods ======= */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Phương thức thanh toán
            </h2>

            <div className="space-y-3 mb-6">
              {[
                { value: "momo", label: "Ví MoMo", color: "pink", logo: "https://developers.momo.vn/v3/img/logo.svg" },
                { value: "vnpay", label: "VNPay", color: "blue", logo: "https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" },
                { value: "zalopay", label: "ZaloPay", color: "blue", logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" },
                { value: "banking", label: "Chuyển khoản ngân hàng", color: "purple" },
                { value: "cash", label: "Thanh toán khi nhận xe", color: "green" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === m.value
                      ? `border-${m.color}-500 bg-${m.color}-50`
                      : `border-gray-200 hover:border-${m.color}-300`
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    {m.logo && <img src={m.logo} alt={m.label} className="w-10 h-10" />}
                    <span className="font-semibold text-gray-800">{m.label}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-2 mb-6">
              <p className="text-sm text-gray-700">✔️ Thông tin thanh toán được mã hóa và bảo mật tuyệt đối</p>
              <p className="text-sm text-gray-700">🕐 Bạn có thể hủy đơn miễn phí trước 24h</p>
            </div>

            {/* ======= Payment Buttons ======= */}
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                onClick={handleBack}
              >
                ← Quay lại
              </button>
              <button
                className="flex-[2] px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  `Thanh toán ${totalPrice.toLocaleString("vi-VN")} VNĐ`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
