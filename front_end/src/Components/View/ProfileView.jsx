import React, { useState } from "react";
import "./ProfileView.css";

const ProfileView = ({ user, loading, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [images, setImages] = useState([]);

  const handleMultiFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const previews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);
  };

  if (loading) return <p className="profile-loading">Đang tải...</p>;
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Bạn chưa đăng nhập</h2>
          <p>Hãy đăng nhập để xem thông tin cá nhân.</p>
          <button
            className="btn-login"
            onClick={() => (window.location.href = "/login")}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdateUser(form);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full bg-gray-900 text-gray-200 px-8 py-4 flex justify-between items-center shadow-md">
        <a href="/home" className="nav-logo-link">
          <div className="text-indigo-400 font-bold text-2xl">SDZ</div>
        </a>
        <div className="nav-links">
          <a href="/home" className="hover:text-indigo-400 transition">
            Trang chủ
          </a>
          <a href="/home">Đi xe</a>
          <a href="/drive">Lái xe</a>
          <a href="/business">Doanh nghiệp</a>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* ===== PROFILE CONTENT ===== */}
      <div className="profile-container two-column">
        {/* CỘT TRÁI */}
        <div className="bg-white rounded-xl shadow-lg w-72 p-6 text-center">
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-32 h-32 rounded-full border-4 border-indigo-500 mx-auto mb-4"
          />
          <h2 className="text-lg font-semibold text-gray-800">
            {user.fullName}
          </h2>
          <h2 className="text-lg font-semibold text-gray-800">{user.role}</h2>
        </div>
        <div className="profile-right">
          <div className="tabs">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Tổng quan
            </button>
            <button
              className={activeTab === "info" ? "active" : ""}
              onClick={() => setActiveTab("info")}
            >
              Thông tin
            </button>
            <button
              className={activeTab === "verify" ? "active" : ""}
              onClick={() => setActiveTab("verify")}
            >
              Xác thực
            </button>
            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              Lịch sử thuê xe
            </button>
          </div>

          {/* TAB: TỔNG QUAN */}
          {activeTab === "overview" && (
            <div className="tab-content">
              <h2>Xin chào, {user.fullName} 👋</h2>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Hồ sơ người dùng
              </h2>
              <p className="text-gray-600">
                Đây là trang thông tin cá nhân của bạn
              </p>
            </div>
          )}

          {/* TAB: THÔNG TIN */}
          {activeTab === "info" && (
            <div className="tab-content mt-6">
              {isEditing ? (
                <div className="bg-white p-6 rounded-2xl shadow-md space-y-4 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                    Cập nhật thông tin cá nhân
                  </h3>

                  <div className="flex flex-col space-y-3">
                    <label className="text-sm font-medium text-gray-600">
                      Tên:
                    </label>
                    <input
                      name="name"
                      value={form.name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-600"
                    />

                    <label className="text-sm font-medium text-gray-600">
                      Email:
                    </label>
                    <input
                      name="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-600"
                    />

                    <label className="text-sm font-medium text-gray-600">
                      Số điện thoại:
                    </label>
                    <input
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-600"
                    />
                  </div>

                  <button
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    onClick={handleSave}
                  >
                    💾 Lưu thay đổi
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <p className="text-gray-700">
                      <strong className="font-medium text-gray-800">
                        Email:
                      </strong>{" "}
                      {user.email}
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-medium text-gray-800">
                        Số điện thoại:
                      </strong>{" "}
                      {user.phoneNumber || "Chưa có"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-medium text-gray-800">
                        Ngày tạo:
                      </strong>{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-medium text-gray-800">
                        Trạng thái:
                      </strong>{" "}
                      {user.isVerified ? (
                        <span className="text-green-600 font-semibold">
                          Đã xác thực ✅
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Chưa xác thực ❌
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg shadow transition duration-200"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Chỉnh sửa thông tin
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: XÁC THỰC */}
          {activeTab === "verify" && (
            <div className="tab-content text-gray-800">
              <h3 className="font-semibold text-lg mb-3">
                Trạng thái xác thực:
              </h3>

              {user.isVerified ? (
                <p className="text-green-600 font-medium">
                  Tài khoản đã được xác thực ✅
                </p>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <p className="text-red-500 mb-4">
                    Bạn chưa xác thực. Vui lòng tải lên{" "}
                    <strong>nhiều ảnh</strong> giấy phép/CCCD để được duyệt.
                  </p>

                  {/* Chọn nhiều ảnh */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultiFileUpload}
                    className="block w-full max-w-sm border border-gray-300 rounded-md p-2 text-gray-700 cursor-pointer"
                  />

                  {/* Hiển thị grid ảnh đã chọn */}
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.previewUrl}
                            alt={`preview-${index}`}
                            className="w-40 h-40 object-cover rounded-lg border-2 border-indigo-500 shadow transition"
                          />
                          <button
                            onClick={() =>
                              setImages(images.filter((_, i) => i !== index))
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                            aria-label="Xóa ảnh này"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-3">
                      Chưa chọn ảnh nào
                    </p>
                  )}

                  {/* Nút gửi ảnh (sau này nối API thật) */}
                  {images.length > 0 && (
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg mt-5 transition"
                      onClick={() => {
                        console.log(
                          "Uploading files:",
                          images.map((x) => x.file)
                        );
                        alert("Ảnh đã được gửi để xác thực! (demo)");
                      }}
                    >
                      Gửi ảnh xác thực
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: LỊCH SỬ THUÊ XE */}
          {activeTab === "history" && (
            <div className="tab-content">
              <h3>Lịch sử thuê xe của bạn</h3>
              <p>Chưa có dữ liệu thuê xe nào được ghi nhận.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;