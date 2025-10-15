import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileView from "@/Components/View/ProfileView";

const ProfileContainer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // lay user tu local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!storedUser || isLoggedIn !== "true") {
      navigate("/login");
      return;
    }

    //parse qua json
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [navigate]);
  const handleUpdateUser = async (updatedUser) => {
    try {
      const res = await fetch(
        `https://68e62cc921dd31f22cc4769d.mockapi.io/api/ev/users/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        }
      );

      if (!res.ok) throw new Error("Cập nhật thất bại!");

      const data = await res.json();

      // ✅ Cập nhật lại state & localStorage
      setUser(data);
      localStorage.setItem("currentUser", JSON.stringify(data));

      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật thông tin!");
    }
  };
  return (
    <ProfileView
      user={user}
      loading={loading}
      onUpdateUser={handleUpdateUser} // truyền props xuống
    />
  );
};

export default ProfileContainer;
