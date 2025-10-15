import React from "react";
import "./ProfileView.css";

const ProfileView = ({ user, loading }) => {
    if (!loading) {
        return (
            <p className="profile-loading">Loading...</p>
        )
    }
    if (!user) {
        return (
            <p className="profile-empty"> Không tìm thấy user, hãy thử lại </p>
        )
    }

    return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={user.avatar || user.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="avatar"
          className="profile-avatar-main"
        />

        <h2 className="profile-name">{user.name || user.fullName}</h2>
        <p className="profile-email">{user.email}</p>

        <div className="profile-info">
          <p><strong>Vai trò:</strong> {user.role || "Renter"}</p>
          <p><strong>Ngày tạo:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>
            <strong>Trạng thái xác thực:</strong>{" "}
            {user.isVerified ? (
              <span className="verified">Đã xác thực ✅</span>
            ) : (
              <span className="unverified">Chưa xác thực ❌</span>
            )}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => alert("Chức năng chỉnh sửa đang được phát triển")}
        >
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
}

export default ProfileView;