import { useState } from "react";
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
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Card,
  Tabs,
  Tag,
  Avatar,
  message,
  Alert,
  Modal,
  Spin,
  Upload,
  Space,
} from "antd";
import "./ProfileView.css";

const { Dragger } = Upload;

const ProfileView = ({ user, loading, onUpdateUser, onUpdateAvatar, onSubmitVerification }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [licenseImages, setLicenseImages] = useState([]);
  const [idCardImages, setIdCardImages] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await onUpdateUser(form);
      setIsEditing(false);
      message.success("Cập nhật thông tin thành công!");
    } catch {
      message.error("Lỗi khi cập nhật thông tin!");
    }
  };

  const removeImage = (index, type) => {
    if (type === "license") {
      setLicenseImages(licenseImages.filter((_, i) => i !== index));
    } else {
      setIdCardImages(idCardImages.filter((_, i) => i !== index));
    }
    message.info("Đã xóa ảnh");
  };

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

  const handleLogout = () => {
    localStorage.clear();
    message.success("Đăng xuất thành công!");
    setTimeout(() => navigate("/login"), 500);
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải thông tin..." size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-empty-container">
        <Card className="empty-card">
          <UserOutlined className="empty-icon" />
          <h2>Bạn chưa đăng nhập</h2>
          <p>Hãy đăng nhập để xem thông tin cá nhân.</p>
          <Button type="primary" size="large" onClick={() => navigate("/login")}>Đăng nhập ngay</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <header className="profile-header">
        <div className="header-content">
          <Button type="text" icon={<HomeOutlined />} onClick={() => navigate("/home")}>
            Trang chủ
          </Button>
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-grid">
          <aside className="profile-sidebar">
            <Card className="sidebar-card glass-card">
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  <Avatar size={140} src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                  {user.isVerified && <CheckCircleOutlined className="verified-badge" />}
                  <label htmlFor="avatar-input" className="avatar-overlay">
                    <CameraOutlined />
                  </label>
                  <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                </div>
              </div>
              <div className="user-info">
                <h2>{user.userName || user.name || "Người dùng"}</h2>
                <Tag color="purple">{user.role || "RENTER"}</Tag>
              </div>
              <div className="user-details">
                <div className="detail-row">
                  <MailOutlined />
                  <span>{user.email}</span>
                </div>
                <div className="detail-row">
                  <PhoneOutlined />
                  <span>{user.phoneNumber || user.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-row">
                  <CalendarOutlined />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</span>
                </div>
              </div>
            </Card>
          </aside>

          <main className="profile-main">
            <Card>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab={<span><UserOutlined />Tổng quan</span>} key="overview">
                  <h2>Xin chào, {user.userName || user.name}! </h2>
                  <p>Chào mừng bạn đến với trang thông tin cá nhân</p>
                  <div className="stats-grid">
                    <Card>
                      <UserOutlined style={{ fontSize: 32 }} />
                      <h3>Hồ sơ</h3>
                      <p>Quản lý thông tin cá nhân</p>
                    </Card>
                    <Card>
                      <SafetyOutlined style={{ fontSize: 32 }} />
                      <h3>Bảo mật</h3>
                      <p>Xác thực tài khoản</p>
                    </Card>
                    <Card>
                      <ClockCircleOutlined style={{ fontSize: 32 }} />
                      <h3>Lịch sử</h3>
                      <p>Xem lịch sử thuê xe</p>
                    </Card>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><MailOutlined />Thông tin</span>} key="info">
                  {isEditing ? (
                    <div className="edit-form">
                      <div className="form-header">
                        <h3>Chỉnh sửa thông tin</h3>
                        <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)} />
                      </div>
                      <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                          <label>Họ và tên</label>
                          <Input name="userName" value={form.userName || form.name || ""} onChange={handleChange} size="large" prefix={<UserOutlined />} />
                        </div>
                        <div>
                          <label>Email</label>
                          <Input name="email" value={form.email || ""} onChange={handleChange} size="large" prefix={<MailOutlined />} />
                        </div>
                        <div>
                          <label>Số điện thoại</label>
                          <Input name="phoneNumber" value={form.phoneNumber || form.phone || ""} onChange={handleChange} size="large" prefix={<PhoneOutlined />} />
                        </div>
                        <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave} block>
                          Lưu thay đổi
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <div className="info-view">
                      <div className="info-header">
                        <h3>Thông tin cá nhân</h3>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                          Chỉnh sửa
                        </Button>
                      </div>
                      <div className="info-grid">
                        <Card>
                          <MailOutlined />
                          <span>Email</span>
                          <p>{user.email}</p>
                        </Card>
                        <Card>
                          <PhoneOutlined />
                          <span>Số điện thoại</span>
                          <p>{user.phoneNumber || user.phone || "Chưa cập nhật"}</p>
                        </Card>
                        <Card>
                          <CalendarOutlined />
                          <span>Ngày tạo</span>
                          <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</p>
                        </Card>
                        <Card>
                          <SafetyOutlined />
                          <span>Trạng thái</span>
                          {user.isVerified ? (
                            <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                          ) : (
                            <Tag color="warning" icon={<WarningOutlined />}>Chưa xác thực</Tag>
                          )}
                        </Card>
                      </div>
                    </div>
                  )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><SafetyOutlined />Xác thực</span>} key="verify">
                  <h3>Xác thực tài khoản</h3>
                  {user.isVerified ? (
                    <div className="verified-state">
                      <CheckCircleOutlined style={{ fontSize: 64, color: "#52c41a" }} />
                      <h3>Tài khoản đã được xác thực!</h3>
                      <p>Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.</p>
                    </div>
                  ) : (
                    <div>
                      <Alert message="Tài khoản chưa xác thực" description="Vui lòng tải lên ảnh Giấy phép lái xe và CCCD/CMND để xác thực tài khoản." type="warning" showIcon style={{ marginBottom: 24 }} />
                      <Card style={{ marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                          <CarOutlined style={{ fontSize: 24, marginRight: 8 }} />
                          <div>
                            <h4>Giấy phép lái xe</h4>
                            <p>Tải lên ảnh 2 mặt giấy phép lái xe</p>
                          </div>
                        </div>
                        <Dragger multiple accept="image/*" beforeUpload={() => false} onChange={(info) => {
                          const files = info.fileList.map((f) => f.originFileObj).filter(Boolean);
                          if (files.length > 0) handleFileUpload(files, "license");
                        }}>
                          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                          <p className="ant-upload-text">Kéo thả ảnh vào đây hoặc nhấp để chọn</p>
                          <p className="ant-upload-hint">Hỗ trợ tải lên nhiều ảnh. Tối đa 5MB/ảnh.</p>
                        </Dragger>
                        {licenseImages.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <p>Đã chọn {licenseImages.length} ảnh</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                              {licenseImages.map((img, index) => (
                                <div key={index} style={{ position: "relative" }}>
                                  <img src={img.previewUrl} alt={`license-${index}`} style={{ width: "100%", borderRadius: 8 }} />
                                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeImage(index, "license")} style={{ position: "absolute", top: 8, right: 8 }} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                      <Card>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                          <IdcardOutlined style={{ fontSize: 24, marginRight: 8 }} />
                          <div>
                            <h4>CCCD/CMND</h4>
                            <p>Tải lên ảnh 2 mặt CCCD hoặc CMND</p>
                          </div>
                        </div>
                        <Dragger multiple accept="image/*" beforeUpload={() => false} onChange={(info) => {
                          const files = info.fileList.map((f) => f.originFileObj).filter(Boolean);
                          if (files.length > 0) handleFileUpload(files, "idcard");
                        }}>
                          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                          <p className="ant-upload-text">Kéo thả ảnh vào đây hoặc nhấp để chọn</p>
                          <p className="ant-upload-hint">Hỗ trợ tải lên nhiều ảnh. Tối đa 5MB/ảnh.</p>
                        </Dragger>
                        {idCardImages.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <p>Đã chọn {idCardImages.length} ảnh</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                              {idCardImages.map((img, index) => (
                                <div key={index} style={{ position: "relative" }}>
                                  <img src={img.previewUrl} alt={`idcard-${index}`} style={{ width: "100%", borderRadius: 8 }} />
                                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeImage(index, "idcard")} style={{ position: "absolute", top: 8, right: 8 }} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                      {(licenseImages.length > 0 || idCardImages.length > 0) && (
                        <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleSubmitVerificationClick} block style={{ marginTop: 24 }}>
                          Gửi ảnh xác thực ({licenseImages.length + idCardImages.length} ảnh)
                        </Button>
                      )}
                    </div>
                  )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><ClockCircleOutlined />Lịch sử</span>} key="history">
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <ClockCircleOutlined style={{ fontSize: 64, color: "#bbb" }} />
                    <h3>Chưa có lịch sử thuê xe</h3>
                    <p>Bạn chưa có chuyến đi nào được ghi nhận.</p>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </main>
        </div>
      </div>

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
