import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined, SafetyOutlined, ClockCircleOutlined, DashboardOutlined,
  EditOutlined, SaveOutlined, CloseOutlined, CarOutlined, LoadingOutlined
} from "@ant-design/icons";
import {
  Button, Input, Card, Tag, Avatar, message, Modal, Spin, Menu
} from "antd";
import { userAPI, driverLicenseVerifyAPI, cccdVerifyAPI } from "@/api/api";
import VerifyPage from "@/pages/renter/VerifyPage";
import OverviewPage from "@/pages/renter/OverviewPage";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [licenseImages, setLicenseImages] = useState([]);
  const [idCardImages, setIdCardImages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  // ===== Load user =====
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    const isLogged = localStorage.getItem("isLoggedIn");
    if (stored && isLogged === "true") setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  // ===== Update user =====
  const handleUpdateUser = async (updated) => {
    if (!updated.fullName?.trim()) return message.error("Vui lòng nhập họ tên!");
    if (!updated.email?.includes("@")) return message.error("Email không hợp lệ!");
    try {
      message.loading({ content: "Đang cập nhật...", key: "update" });
      const res = await userAPI.updateUser(updated);
      localStorage.setItem("currentUser", JSON.stringify(res));
      setUser(res);
      message.success({ content: "Cập nhật thành công!", key: "update" });
    } catch (err) {
      message.error("Cập nhật thất bại!");
    }
  };

  // ===== Update avatar =====
  const handleUpdateAvatar = async (file) => {
    if (!file || !file.type.startsWith("image/")) return message.error("Chỉ chọn file ảnh!");
    if (file.size > 5 * 1024 * 1024) return message.error("Tối đa 5MB!");
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = { ...user, avatar: reader.result };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      message.success("Cập nhật ảnh đại diện thành công!");
    };
    reader.readAsDataURL(file);
  };

  // ===== Upload giấy tờ =====
  const handleUploadFiles = async (files, apiFunc, type) => {
    if (!files?.length) return message.warning("Chưa chọn ảnh!");
    message.loading({ content: `Đang tải ${type}...`, key: type });
    const base64 = await Promise.all(Array.from(files).map(f => new Promise(r => {
      const rd = new FileReader(); rd.onloadend = () => r(rd.result); rd.readAsDataURL(f);
    })));
    const renterId = localStorage.getItem("renter_Id") || user?.renter_Id;
    const data = type === "license"
      ? { renterId, urlDriverLicense: base64[0], backImageUrl: base64[1] || base64[0] }
      : { renter_id: renterId, url_Cccd_Cmnd_front: base64[0], url_Cccd_Cmnd_back: base64[1] || base64[0] };
    await apiFunc(data);
    const updated = { ...user, [`${type}Images`]: base64 };
    localStorage.setItem("currentUser", JSON.stringify(updated));
    setUser(updated);
    message.success({ content: `Đã tải ${type} thành công!`, key: type });
  };

  const handleSubmitVerification = async (licenseFiles, idCardFiles) => {
    if (!licenseFiles?.length && !idCardFiles?.length)
      return message.warning("Vui lòng tải lên ít nhất 1 loại giấy tờ!");
    await Promise.all([
      licenseFiles?.length && handleUploadFiles(licenseFiles, driverLicenseVerifyAPI.uploadLicense, "license"),
      idCardFiles?.length && handleUploadFiles(idCardFiles, cccdVerifyAPI.uploadCCCD, "cccd")
    ]);
    message.success("Đã gửi giấy tờ xác thực!");
  };

  // ===== Avatar modal =====
  const handleAvatarUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setIsAvatarModalVisible(true);
  };
  const confirmAvatarUpload = async () => {
    const file = document.getElementById("avatar-input")?.files?.[0];
    if (file) {
      setIsAvatarUploading(true);
      await handleUpdateAvatar(file);
      setIsAvatarUploading(false);
      setIsAvatarModalVisible(false);
    }
  };

  // ===== UI sections =====
  const renderInfo = () => (
    <Card className="shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><UserOutlined />Thông tin cá nhân</h2>
      {isEditing ? (
        <div className="space-y-4">
          <Input name="fullName" placeholder="Họ tên" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
          <Input name="phone_number" placeholder="Số điện thoại" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
          <div className="flex gap-2 mt-4">
            <Button type="primary" onClick={() => { handleUpdateUser(form); setIsEditing(false); }}><SaveOutlined /> Lưu</Button>
            <Button onClick={() => setIsEditing(false)}><CloseOutlined /> Hủy</Button>
          </div>
        </div>
      ) : (
        <div>
          <p><b>Họ tên:</b> {user.fullName || "N/A"}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Điện thoại:</b> {user.phone || user.phone_number || "Chưa cập nhật"}</p>
          <Tag color="purple">{user.role || "RENTER"}</Tag>
          <Button className="mt-3" onClick={() => { setIsEditing(true); setForm(user); }}><EditOutlined /> Chỉnh sửa</Button>
        </div>
      )}
    </Card>
  );

  const renderVerify = () => (
    <Card className="shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><SafetyOutlined />Xác minh giấy tờ</h2>
      <VerifyPage />
    </Card>
  );

  const renderHistory = () => (
    <Card className="shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ClockCircleOutlined />Lịch sử đặt xe</h2>
      {myBookings.length > 0 ? (
        myBookings.map((b, i) => (
          <div key={i} className="p-3 border-b">
            <b>{b.vehicle?.name}</b> – {b.startDate} → {b.endDate}
            <Tag color={b.status === "completed" ? "green" : "blue"} className="ml-2">{b.status}</Tag>
          </div>
        ))
      ) : (
        <div className="text-center py-6">
          <CarOutlined style={{ fontSize: 40, color: "#bbb" }} />
          <p>Chưa có lịch sử đặt xe</p>
          <Button type="primary" onClick={() => navigate("/vehicles")}>Thuê xe ngay</Button>
        </div>
      )}
    </Card>
  );

  if (loading)
    return <div className="flex justify-center items-center h-screen"><Spin indicator={<LoadingOutlined spin />} /></div>;
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-6">
          <UserOutlined className="text-4xl mb-3" />
          <h3>Vui lòng đăng nhập để xem hồ sơ</h3>
          <Button type="primary" onClick={() => navigate("/login")}>Đăng nhập</Button>
        </Card>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="bg-white shadow w-64 min-h-screen">
        <div className="p-6 border-b text-center">
          <Avatar size={80} src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
          <h3 className="font-bold mt-2">{user.userName || "User"}</h3>
          <Tag>{user.role}</Tag>
          <input id="avatar-input" type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
          <Button onClick={() => document.getElementById("avatar-input").click()} size="small" className="mt-2">Đổi ảnh</Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          items={[
            { key: "overview", icon: <DashboardOutlined />, label: "Tổng quan" },
            { key: "info", icon: <UserOutlined />, label: "Thông tin cá nhân" },
            { key: "verify", icon: <SafetyOutlined />, label: "Xác minh giấy tờ" },
            { key: "history", icon: <ClockCircleOutlined />, label: "Lịch sử đặt xe" },
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {selectedMenu === "overview" && <OverviewPage />}
        {selectedMenu === "info" && renderInfo()}
        {selectedMenu === "verify" && renderVerify()}
        {selectedMenu === "history" && renderHistory()}
      </div>

      {/* Avatar Modal */}
      <Modal
        title="Xác nhận ảnh đại diện"
        open={isAvatarModalVisible}
        onOk={confirmAvatarUpload}
        confirmLoading={isAvatarUploading}
        onCancel={() => setIsAvatarModalVisible(false)}
      >
        {avatarPreview && <Avatar size={150} src={avatarPreview} style={{ display: "block", margin: "20px auto" }} />}
      </Modal>
    </div>
  );
};

export default ProfilePage;
