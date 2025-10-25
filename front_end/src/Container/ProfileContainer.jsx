import React, { useState, useEffect } from "react";
import { message, Spin } from "antd";
import { licenseAPI, userAPI } from "../api/api";

export default function ProfileContainer() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Remove unused state variables
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);

  // 🔥 Load user từ localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        console.log("🔍 Checking localStorage:", { storedUser, isLoggedIn });

        if (isLoggedIn === "true" && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          console.log("✅ Full user object:", parsedUser);
          console.log("📝 Available fields:", Object.keys(parsedUser));
          
          setUser(parsedUser);
          setForm(parsedUser);
        } else {
          console.warn("⚠️ No user found in localStorage");
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error parsing user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    // Validate form
    if (!form.fullName?.trim()) {
      message.error("Vui lòng nhập họ tên!");
      return;
    }
    if (!form.email?.trim()) {
      message.error("Vui lòng nhập email!");
      return;
    }
    if (!form.email.includes('@')) {
      message.error("Email không hợp lệ!");
      return;
    }
    if (!form.phoneNumber?.trim()) {
      message.error("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phoneNumber.trim())) {
      message.error("Số điện thoại không hợp lệ!");
      return;
    }

    try {
      setLoading(true);
      message.loading({ content: "Đang cập nhật...", key: "updateUser" });
      
      const result = await userAPI.updateUser(form);
      
      localStorage.setItem("currentUser", JSON.stringify(result));
      setUser(result);
      setIsEditing(false);
      
      message.success({ content: "✅ Cập nhật thành công!", key: "updateUser" });
    } catch (err) {
      console.error("❌ Update error:", err);
      message.error({ 
        content: err.message || "❌ Cập nhật thất bại!", 
        key: "updateUser" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMultiFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and size
    const invalidFiles = files.filter(
      file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      message.error("Chỉ chấp nhận file ảnh và dung lượng tối đa 5MB!");
      return;
    }

    const previews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);
  };

  // Cleanup preview URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  const handleSubmitVerification = async () => {
    if (images.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ảnh!");
      return;
    }

    try {
      setLoading(true);
      message.loading({ content: "Đang tải lên ảnh...", key: "uploadImages" });
      
      console.log("📤 Uploading files:", images.map((x) => x.file));
      
      // Upload từng ảnh với progress tracking
      let uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        message.loading({ 
          content: `Đang tải ảnh ${i + 1}/${images.length}...`, 
          key: "uploadImages" 
        });
        const url = await licenseAPI.uploadImage(images[i].file);
        uploadedUrls.push(url);
      }

      message.loading({ 
        content: "Đang gửi yêu cầu xác thực...", 
        key: "uploadImages" 
      });

      // Gửi yêu cầu xác thực
      const payload = {
        renter_id: user?.userId || localStorage.getItem("userId"),
        license_urls: uploadedUrls,
        status: "pending",
        submitted_at: new Date().toISOString(),
      };

      await licenseAPI.create(payload);
      
      message.success({ 
        content: "✅ Ảnh đã được gửi để xác thực!", 
        key: "uploadImages",
        duration: 5 
      });
      
      // Cleanup
      setImages(prev => {
        prev.forEach(img => URL.revokeObjectURL(img.previewUrl));
        return [];
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      message.error({ 
        content: err.message || "❌ Gửi ảnh thất bại, vui lòng thử lại.", 
        key: "uploadImages" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function để lấy tên hiển thị
  const getDisplayName = () => {
    if (!user) return "Người dùng";
    return user.fullName || user.name || user.username || user.email?.split('@')[0] || "Người dùng";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">Hãy đăng nhập để xem thông tin cá nhân.</p>
          <button
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition"
            onClick={() => (window.location.href = "/login")}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-gray-900 text-gray-200 px-8 py-4 flex justify-between items-center shadow-md z-50">
        <a href="/home" className="text-indigo-400 font-bold text-2xl hover:text-indigo-300 transition">
          SDZ
        </a>
        <div className="flex items-center gap-6">
          <a href="/home" className="hover:text-indigo-400 transition">Trang chủ</a>
          <a href="/home" className="hover:text-indigo-400 transition">Đi xe</a>
          <a href="/drive" className="hover:text-indigo-400 transition">Lái xe</a>
          <a href="/business" className="hover:text-indigo-400 transition">Doanh nghiệp</a>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center sticky top-24">
              <img
                src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-indigo-500 mx-auto mb-4 object-cover"
              />
              <h2 className="text-xl font-semibold text-gray-800">{getDisplayName()}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {user.role || "RENTER"}
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              
              {/* TABS */}
              <div className="flex border-b">
                {["overview", "info", "verify", "history"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 font-medium transition ${
                      activeTab === tab
                        ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab === "overview" && "Tổng quan"}
                    {tab === "info" && "Thông tin"}
                    {tab === "verify" && "Xác thực"}
                    {tab === "history" && "Lịch sử thuê xe"}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* TAB: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Xin chào, {getDisplayName()} 👋
                    </h2>
                    <h3 className="text-xl font-semibold text-gray-700">Hồ sơ người dùng</h3>
                    <p className="text-gray-600">Đây là trang thông tin cá nhân của bạn</p>
                  </div>
                )}

                {/* TAB: INFO */}
                {activeTab === "info" && (
                  <div className="space-y-6">
                    {isEditing ? (
                      <div className="max-w-md mx-auto space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                          Cập nhật thông tin cá nhân
                        </h3>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-800">
                            Tên đầy đủ:
                          </label>
                          <input
                            name="fullName"
                            value={form.fullName || form.name || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          />

                          <label className="block text-sm font-medium text-gray-600 mt-3">
                            Email:
                          </label>
                          <input
                            name="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          />

                          <label className="block text-sm font-medium text-gray-600 mt-3">
                            Số điện thoại:
                          </label>
                          <input
                            name="phoneNumber"
                            value={form.phoneNumber || form.phone || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={handleUpdateUser}
                            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition"
                          >
                            💾 Lưu thay đổi
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setForm(user);
                            }}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="font-medium text-gray-800">{user.email}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                            <p className="font-medium text-gray-800">
                              {user.phoneNumber || user.phone || "Chưa có"}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
                            <p className="font-medium text-gray-800">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                            <p className="font-medium">
                              {user.isVerified ? (
                                <span className="text-green-600">Đã xác thực ✅</span>
                              ) : (
                                <span className="text-red-500">Chưa xác thực ❌</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-center mt-6">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg shadow transition"
                          >
                            ✏️ Chỉnh sửa thông tin
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB: VERIFY */}
                {activeTab === "verify" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Trạng thái xác thực:</h3>

                    {user.isVerified ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <p className="text-green-600 font-medium text-lg">
                          Tài khoản đã được xác thực ✅
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800">
                            ⚠️ Bạn chưa xác thực. Vui lòng tải lên ảnh giấy phép lái xe/CCCD để được duyệt.
                          </p>
                        </div>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultiFileUpload}
                          className="block w-full border border-gray-300 rounded-lg p-3 text-gray-700 cursor-pointer hover:border-indigo-400 transition"
                        />

                        {images.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {images.map((img, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={img.previewUrl}
                                    alt={`preview-${index}`}
                                    className="w-full h-40 object-cover rounded-lg border-2 border-indigo-300 shadow transition"
                                  />
                                  <button
                                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                                    className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={handleSubmitVerification}
                              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg transition"
                            >
                              📤 Gửi ảnh xác thực ({images.length} ảnh)
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic text-center py-4">
                            Chưa chọn ảnh nào
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: HISTORY */}
                {activeTab === "history" && (
                  <div className="text-center py-12">
                    <div className="inline-block p-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-lg mb-2">📋 Lịch sử thuê xe</p>
                      <p className="text-gray-500">Chưa có dữ liệu thuê xe nào được ghi nhận.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}