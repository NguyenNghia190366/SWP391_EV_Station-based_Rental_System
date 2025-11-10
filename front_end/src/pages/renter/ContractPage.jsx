import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ContractPage = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const [contractData, setContractData] = useState(null);
  const [signature, setSignature] = useState("");
  const [signingMethod, setSigningMethod] = useState("electronic");
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const pendingBooking = localStorage.getItem("pendingBooking");

    if (!pendingBooking) {
      alert("Không tìm thấy thông tin đặt xe!");
      navigate("/vehicles");
      return;
    }

    const data = JSON.parse(pendingBooking);
    const start = new Date(data.bookingData.startDate);
    const end = new Date(data.bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * data.vehicle.price * 1000;
    const deposit = totalPrice * 0.3;

    setContractData({ ...data, totalPrice, deposit, days });
  }, [navigate]);

  const handleSignatureInput = (value) => {
    setSignature(value);
    if (value && !isAgreed) setIsAgreed(true);
  };

  const handleAccept = () => {
    if (!signingMethod) {
      alert("Vui lòng chọn phương thức ký hợp đồng!");
      return;
    }

    if (signingMethod === "electronic" && (!signature || signature.trim() === "")) {
      alert("Vui lòng ký xác nhận hợp đồng điện tử!");
      return;
    }

    const contractWithSignature = {
      ...contractData,
      signature: signingMethod === "electronic" ? signature : "PAPER_SIGNING",
      signingMethod,
      contractNumber: `EVR-${Date.now()}`,
      signedAt: new Date().toISOString(),
      status: signingMethod === "electronic" ? "pending_payment" : "pending_paper_signing",
    };

    localStorage.setItem("pendingContract", JSON.stringify(contractWithSignature));
    navigate(`/payment/${vehicleId}`);
  };

  const handleDecline = () => {
    if (window.confirm("Bạn có chắc muốn hủy hợp đồng này?")) {
      localStorage.removeItem("pendingBooking");
      navigate("/vehicles");
    }
  };

  if (!contractData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Đang tải hợp đồng...</div>
      </div>
    );
  }

  const { vehicle, bookingData, user, totalPrice, deposit } = contractData;

  const calculateDays = () => {
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* ==== HEADER ==== */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">📄 HỢP ĐỒNG THUÊ XE ĐIỆN</h1>
          <p className="text-indigo-100 text-sm md:text-base">Số hợp đồng: EVR-{Date.now()}</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* === BÊN THUÊ === */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">I</span>
              CÁC BÊN THAM GIA HỢP ĐỒNG
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                👤 BÊN THUÊ (Bên B):
              </h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Họ tên:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Số điện thoại:</strong> {bookingData.phone}</p>
                <p><strong>Mã khách hàng:</strong> {user.userId}</p>
              </div>
            </div>
          </section>

          {/* === PHƯƠNG THỨC KÝ === */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">VI</span>
              PHƯƠNG THỨC KÝ HỢP ĐỒNG
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {["electronic", "paper"].map((method) => (
                <label
                  key={method}
                  className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${
                    signingMethod === method
                      ? "ring-4 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-500"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSigningMethod(method)}
                >
                  <div className="text-center">
                    <span className="text-5xl mb-3 block">
                      {method === "electronic" ? "📱" : "📄"}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {method === "electronic" ? "Ký điện tử" : "Ký trực tiếp"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {method === "electronic"
                        ? "Ký trực tuyến, tiện lợi"
                        : "Ký tại trạm cùng nhân viên"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* === CHỮ KÝ === */}
            {signingMethod === "electronic" ? (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <input
                  type="text"
                  placeholder="Nhập họ tên để ký điện tử"
                  className="w-full text-center text-lg font-semibold text-gray-700 bg-transparent border-b-2 border-blue-300 focus:border-indigo-500 outline-none pb-2 mb-2"
                  value={signature}
                  onChange={(e) => handleSignatureInput(e.target.value)}
                />
                <p className="text-center text-xs text-gray-500 mt-2">
                  ✍️ Gõ tên của bạn để ký điện tử
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <p>Hợp đồng sẽ được ký tại trạm {bookingData.pickupLocation}</p>
              </div>
            )}
          </section>

          {/* === CHECKBOX ĐỒNG Ý === */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-gray-700 leading-relaxed">
                Tôi đồng ý với tất cả các điều khoản hợp đồng.
              </span>
            </label>
          </div>

          {/* === NÚT HÀNH ĐỘNG === */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition duration-300"
              onClick={handleDecline}
            >
              ✕ Từ chối
            </button>
            <button
              className={`flex-1 font-bold py-4 px-6 rounded-xl shadow-lg transition duration-300 ${
                !isAgreed || (signingMethod === "electronic" && !signature)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:scale-105"
              }`}
              onClick={handleAccept}
              disabled={!isAgreed || (signingMethod === "electronic" && !signature)}
            >
              {signingMethod === "electronic" ? "Đồng ý & Thanh toán" : "Xác nhận đặt lịch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPage;
