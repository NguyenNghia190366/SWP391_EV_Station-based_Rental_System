import React, { useState } from "react";
import "./ProfileView.css";

const ProfileView = ({ user, loading, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user || {});

  if (loading) return <p className="profile-loading">Loading...</p>;
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
    onUpdateUser(form); // gọi hàm update từ Container
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      {/* ===== NAVBAR SDZ ===== */}
      <nav className="profile-navbar">
        <a href="/home" className="nav-logo-link">
          <div className="nav-logo">SDZ</div>
        </a>
        
        <div className="nav-links">
          <a href="/home" className="home-btn">Trang Chủ</a>
          <a href="/home">Đi xe</a>
          <a href="/drive">Lái xe</a>
          <a href="/business">Doanh nghiệp</a>
          {user ? (
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Đăng xuất
            </button>
          ) : (
            <button
              className="login-btn"
              onClick={() => (window.location.href = "/login")}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </nav>

      {/* ===== PROFILE LAYOUT ===== */}
      <div className="profile-container two-column">
        {/* CỘT TRÁI - Avatar và tên */}
        <div className="profile-left">
          <img
            src={
              user.avatar ||
              user.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            className="profile-avatar-large"
          />
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-role">{user.role || "Renter"}</p>
        </div>

        {/* CỘT PHẢI - Thông tin chi tiết */}
        <div className="profile-right">
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
              <button className="btn btn-save" onClick={handleSave}>
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
                  <strong>Xác thực:</strong>{" "}
                  {user.isVerified ? "Đã xác thực ✅" : "Chưa xác thực ❌"}
                </p>
              </div>
              <button
                className="btn btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa thông tin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
