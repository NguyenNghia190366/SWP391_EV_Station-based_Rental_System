import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  IdcardOutlined,
  CarOutlined,
  CameraOutlined,
  LoadingOutlined,
  InboxOutlined,
  DashboardOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Card,
  Tag,
  Avatar,
  message,
  Alert,
  Modal,
  Spin,
  Upload,
  Space,
  Menu,
  Statistic,
} from "antd";
import VerifyPage from "../../pages/VerifyPage";
import OverviewPage from "../../../../pages/OverviewPage";
import InfoPage from "../../../../pages/InfoPage";
import HistoryPage from "../../../../pages/HistoryPage";

const { Dragger } = Upload;

const ProfileView = ({ user, loading, onUpdateUser, onUpdateAvatar, onSubmitVerification }) => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [licenseImages, setLicenseImages] = useState([]);
  const [idCardImages, setIdCardImages] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);

  // Sidebar menu
  const menuItems = [
    { key: "overview", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "info", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { key: "verify", icon: <SafetyOutlined />, label: "Xác minh giấy tờ" },
    { key: "history", icon: <ClockCircleOutlined />, label: "Lịch sử đặt xe" },
  ];

  // Load bookings from localStorage
  useEffect(() => {
    const loadBookings = () => {
      try {
        const bookings = JSON.parse(localStorage.getItem("myBookings") || "[]");
        const userBookings = bookings.filter(
          (b) => b.user?.userId === user?.userId || b.user?.email === user?.email
        );
        setMyBookings(userBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
        setMyBookings([]);
      }
    };
    if (user) loadBookings();
  }, [user]);

  // === Avatar upload ===
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn file ảnh!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Dung lượng ảnh tối đa 5MB!");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsAvatarModalVisible(true);
  };

  const handleConfirmAvatarUpload = async () => {
    const fileInput = document.getElementById("avatar-input");
    const file = fileInput?.files?.[0];
    if (file && onUpdateAvatar) {
      setIsAvatarUploading(true);
      try {
        await onUpdateAvatar(file);
        setIsAvatarModalVisible(false);
        setAvatarPreview(null);
        message.success("Cập nhật ảnh đại diện thành công!");
      } catch {
        message.error("Lỗi khi cập nhật ảnh đại diện!");
      } finally {
        setIsAvatarUploading(false);
      }
    }
  };

  // === Form change & save ===
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    try {
      await onUpdateUser(form);
      setIsEditing(false);
      message.success("Cập nhật thông tin thành công!");
    } catch {
      message.error("Lỗi khi cập nhật thông tin!");
    }
  };

  // === File remove ===
  const removeImage = (index, type) => {
    if (type === "license") {
      setLicenseImages(licenseImages.filter((_, i) => i !== index));
    } else {
      setIdCardImages(idCardImages.filter((_, i) => i !== index));
    }
    message.info("Đã xóa ảnh");
  };

  // === Upload handler for old verify section (giữ nguyên logic nếu cần dùng lại) ===
  const handleFileUpload = (fileList, type) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    const previews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    if (type === "license") {
      setLicenseImages((prev) => [...prev, ...previews]);
      message.success(`Đã chọn ${files.length} ảnh giấy phép lái xe`);
    } else {
      setIdCardImages((prev) => [...prev, ...previews]);
      message.success(`Đã chọn ${files.length} ảnh CCCD/CMND`);
    }
  };

  // === Submit verify handler ===
  const handleSubmitVerificationClick = async () => {
    if (licenseImages.length === 0 && idCardImages.length === 0) {
      message.warning("Vui lòng chọn ít nhất một loại giấy tờ!");
      return;
    }
    const licenseFiles = licenseImages.map((img) => img.file);
    const idCardFiles = idCardImages.map((img) => img.file);
    if (onSubmitVerification) {
      try {
        await onSubmitVerification(licenseFiles, idCardFiles);
        setLicenseImages([]);
        setIdCardImages([]);
        message.success("Gửi giấy tờ xác thực thành công!");
      } catch {
        message.error("Lỗi khi gửi giấy tờ xác thực!");
      }
    }
  };

  // === Loading and unauth ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải thông tin..." size="large" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <Card className="max-w-md w-full text-center shadow-xl">
          <UserOutlined className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">Hãy đăng nhập để xem thông tin cá nhân.</p>
          <Button type="primary" size="large" onClick={() => navigate("/login")}>Đăng nhập ngay</Button>
        </Card>
      </div>
    );
  }

  // === Render content by menu ===
  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return <OverviewPage />;

      case "info":
        return <InfoPage />;

      // ✅ Gộp VerifyPage thay vì form dài
      case "verify":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <SafetyOutlined className="text-green-500" />
                Xác minh giấy tờ
              </h2>
              <p className="text-gray-600 mt-2">
                Tải lên giấy tờ để xác thực tài khoản và sử dụng đầy đủ dịch vụ
              </p>
            </div>

            {/* ✅ Nhúng VerifyPage */}
            <div className="mt-8">
              <VerifyPage />
            </div>
          </Card>
        );

      case "history":
        return <HistoryPage />;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{
          width: "280px",
          minWidth: "280px",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="text-center">
            <Avatar
              size={80}
              src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              className="border-4 border-white shadow-xl mx-auto mb-3"
            />
            <h3 className="text-lg font-bold text-white mb-1">{user.userName || user.name || "User"}</h3>
            <Tag color="purple" className="text-xs">{user.role || "RENTER"}</Tag>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key)}
            className="border-0 pt-4"
            style={{ fontSize: "16px", fontWeight: "500" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">{renderContent()}</div>

      {/* Avatar Modal */}
      <Modal
        title="Xác nhận ảnh đại diện"
        open={isAvatarModalVisible}
        onOk={handleConfirmAvatarUpload}
        onCancel={() => {
          setIsAvatarModalVisible(false);
          setAvatarPreview(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={isAvatarUploading}
      >
        <div style={{ textAlign: "center" }}>
          <p>Bạn có chắc chắn muốn cập nhật ảnh đại diện này?</p>
          {avatarPreview && <Avatar size={200} src={avatarPreview} style={{ margin: "20px 0" }} />}
        </div>
      </Modal>
    </div>
  );
};

export default ProfileView;
