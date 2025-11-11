import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import {
  UserOutlined, SafetyOutlined, ClockCircleOutlined, DashboardOutlined,
  EditOutlined, SaveOutlined, CloseOutlined, CarOutlined, LoadingOutlined
} from "@ant-design/icons";
import {
  Button, Input, Card, Tag, Avatar, message, Modal, Spin, Menu, Table
} from "antd";
import dayjs from "dayjs";
import { useUsers } from "@/hooks/useUsers";
import { useDriverLicense } from "@/hooks/useDriverLicense";
import { useCccd } from "@/hooks/useCccd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useRenters } from "@/hooks/useRenters";
import VerifyPage from "@/pages/renter/VerifyPage";
import OverviewPage from "@/pages/renter/OverviewPage";

const ProfilePage = () => {
  const navigate = useNavigate();
  const instance = useAxiosInstance();
  const { getRenterIdByUserId } = useRenters();
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
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const { updateProfile, uploadAvatar } = useUsers();
  const { updateStatus: updateLicenseStatus } = useDriverLicense();
  const { updateStatus: updateCcqdStatus } = useCccd();

  // ===== Load user =====
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    const isLogged = localStorage.getItem("isLoggedIn");
    if (stored && isLogged === "true") setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  // ===== Load rental history =====
  useEffect(() => {
    if (selectedMenu === "history" && user) {
      fetchRentalHistory();
    }
  }, [selectedMenu, user]);

  const fetchRentalHistory = async () => {
    try {
      setBookingsLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.warning("Không tìm thấy userId!");
        return;
      }

      const renterId = await getRenterIdByUserId(userId);
      const [rentalOrdersRes, vehiclesRes, stationsRes] = await Promise.all([
        instance.get(`/RentalOrders?renter_id=${renterId}`),
        instance.get("/Vehicles"),
        instance.get("/Stations"),
      ]);

      const rentalOrders = Array.isArray(rentalOrdersRes.data)
        ? rentalOrdersRes.data
        : rentalOrdersRes.data?.data || [];

      const vehicles = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data?.data || [];

      const stations = Array.isArray(stationsRes.data)
        ? stationsRes.data
        : stationsRes.data?.data || [];

      const merged = rentalOrders.map((order) => ({
        ...order,
        vehicleName: vehicles.find((v) => v.vehicleId === order.vehicleId)?.vehicleName || `#${order.vehicleId}`,
        pickupStationName: stations.find((s) => s.stationId === order.pickupStationId)?.stationName || `#${order.pickupStationId}`,
        returnStationName: stations.find((s) => s.stationId === order.returnStationId)?.stationName || `#${order.returnStationId}`,
      }));

      setMyBookings(merged);
    } catch (err) {
      console.error("❌ Lỗi tải lịch sử thuê:", err);
      message.error("Không thể tải lịch sử thuê!");
    } finally {
      setBookingsLoading(false);
    }
  };

  // ===== Update user =====
  const handleUpdateUser = async (updated) => {
    try {
      // Yup validation schema for profile update
      const profileSchema = yup.object({
        fullName: yup
          .string()
          .required("Vui lòng nhập họ tên!")
          .min(2, "Họ tên phải có ít nhất 2 ký tự!"),
        email: yup
          .string()
          .required("Vui lòng nhập email!")
          .email("Email không hợp lệ!"),
        phone_number: yup
          .string()
          .required("Vui lòng nhập số điện thoại!")
          .matches(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số!"),
      });

      // Validate before submission
      try {
        await profileSchema.validate(updated, { abortEarly: false });
      } catch (err) {
        if (err.name === "ValidationError") {
          const errorMessages = err.inner.map(e => e.message).join("; ");
          message.error(errorMessages);
          return;
        }
      }

      const userId = user?.user_id || user?.userId;
      message.loading({ content: "Đang cập nhật...", key: "update" });
      const res = await updateProfile(userId, updated);
      localStorage.setItem("currentUser", JSON.stringify(res));
      setUser(res);
      message.success({ content: "Cập nhật thành công!", key: "update" });
    } catch (err) {
      console.error("❌ Update profile error:", err);
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
    const { uploadDriverLicense } = useDriverLicense();
    const { uploadCccd } = useCccd();
    await Promise.all([
      licenseFiles?.length && handleUploadFiles(licenseFiles, uploadDriverLicense, "license"),
      idCardFiles?.length && handleUploadFiles(idCardFiles, uploadCccd, "cccd")
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
      {bookingsLoading ? (
        <Spin tip="Đang tải lịch sử..." />
      ) : myBookings.length > 0 ? (
        <Table
          columns={[
            {
              title: "Mã đơn",
              dataIndex: "orderId",
              key: "orderId",
              render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
            },
            {
              title: "Xe",
              dataIndex: "vehicleName",
              key: "vehicleName",
            },
            {
              title: "Trạm (nhận → trả)",
              key: "stations",
              render: (_, record) => (
                <span>{record.pickupStationName} → {record.returnStationName}</span>
              ),
            },
            {
              title: "Thời gian thuê",
              key: "rentalTime",
              render: (_, record) => (
                <span>
                  {dayjs(record.startTime).format("DD/MM HH:mm")} →{" "}
                  {dayjs(record.endTime).format("DD/MM HH:mm")}
                </span>
              ),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              render: (status) => {
                const statusMap = {
                  BOOKED: { color: "blue", text: "Chờ duyệt" },
                  APPROVED: { color: "green", text: "Đã duyệt" },
                  REJECTED: { color: "red", text: "Từ chối" },
                  IN_USE: { color: "orange", text: "Đang sử dụng" },
                  COMPLETED: { color: "cyan", text: "Hoàn tất" },
                  CANCELLED: { color: "default", text: "Huỷ" },
                };
                const statusInfo = statusMap[status] || { color: "default", text: status };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
              },
            },
          ]}
          dataSource={myBookings}
          rowKey="orderId"
          pagination={{ pageSize: 10 }}
          size="small"
        />
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
