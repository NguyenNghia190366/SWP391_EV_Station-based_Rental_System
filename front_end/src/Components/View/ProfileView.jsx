import React, { useState } from "react";
import "./ProfileView.css";

const ProfileView = ({ user, loading, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user || {});

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
      <nav className="profile-navbar">
        <a href="/home" className="nav-logo-link">
          <div className="nav-logo">SDZ</div>
        </a>
        <div className="nav-links">
          <a href="/home" className="home-btn">
            Trang Chủ
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
        <div className="profile-left">
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            className="profile-avatar-large"
          />
          <h2 className="profile-name">{user.fullName}</h2>
        </div>

        {/* CỘT PHẢI */}
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
              <h2>Xin chào, {user.name} 👋</h2>
              <p>
                Đây là trang hồ sơ SDZ của bạn — nơi bạn có thể chỉnh sửa thông
                tin, xác thực giấy phép lái xe, và xem lại lịch sử thuê xe.
              </p>
            </div>
          )}

          {/* TAB: THÔNG TIN */}
          {activeTab === "info" && (
            <div className="tab-content">
              {isEditing ? (
                <div className="profile-form">
                  <label>Tên:</label>
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                  />
                  <label>Email:</label>
                  <input
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                  />
                  <label>Số điện thoại:</label>
                  <input
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                  />
                  <button className="btn-save" onClick={handleSave}>
                    Lưu thay đổi
                  </button>
                </div>
              ) : (
                <>
                  <div className="profile-info-grid">
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {user.phone || "Chưa có"}
                    </p>
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {user.isVerified ? "Đã xác thực ✅" : "Chưa xác thực ❌"}
                    </p>
                  </div>
                  <button
                    className="btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa thông tin
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB: XÁC THỰC */}
          {activeTab === "verify" && (
            <div className="tab-content">
              <h3>Trạng thái xác thực:</h3>
              {user.isVerified ? (
                <p className="verified">Tài khoản đã được xác thực ✅</p>
              ) : (
                <>
                  <p className="unverified">
                    Bạn chưa xác thực. Vui lòng tải lên ảnh giấy phép lái xe của
                    bạn.
                  </p>
                  <input type="file" className="upload-input" />
                  <button className="btn-save">Tải lên để xác thực</button>
                </>
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
