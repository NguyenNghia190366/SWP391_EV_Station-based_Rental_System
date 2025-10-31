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
  const [myBookings, setMyBookings] = useState([]);

  // Load bookings from localStorage
  useEffect(() => {
    const loadBookings = () => {
      try {
        const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        // Filter bookings for current user
        const userBookings = bookings.filter(b => 
          b.user?.userId === user?.userId || 
          b.user?.email === user?.email
        );
        setMyBookings(userBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setMyBookings([]);
      }
    };

    if (user) {
      loadBookings();
    }
  }, [user]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải thông tin..." size="large" />
        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header Actions */}
      <header className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={() => navigate("/home")}
            className="text-gray-700 hover:text-indigo-600 font-semibold"
          >
            Trang chủ
          </Button>
          <Button 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="font-semibold"
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - User Info */}
          <aside className="lg:col-span-1">
            <Card className="shadow-xl rounded-2xl overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
              <div className="text-center p-6">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <Avatar 
                    size={140} 
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    className="border-4 border-white shadow-xl"
                  />
                  {user.isVerified && (
                    <CheckCircleOutlined className="absolute bottom-2 right-2 text-3xl text-green-500 bg-white rounded-full" />
                  )}
                  <label 
                    htmlFor="avatar-input" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                  >
                    <CameraOutlined className="text-white text-3xl" />
                  </label>
                  <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                </div>

                {/* User Name & Role */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.userName || user.name || "Người dùng"}</h2>
                <Tag color="purple" className="text-sm font-semibold px-4 py-1">{user.role || "RENTER"}</Tag>

                {/* User Details */}
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MailOutlined className="text-indigo-500 text-lg" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <PhoneOutlined className="text-indigo-500 text-lg" />
                    <span className="text-sm">{user.phoneNumber || user.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarOutlined className="text-indigo-500 text-lg" />
                    <span className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</span>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-2">
            <Card className="shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
              <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                <Tabs.TabPane tab={<span><UserOutlined />Tổng quan</span>} key="overview">
                  <div className="p-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Xin chào, {user.userName || user.name}! 👋</h2>
                    <p className="text-gray-600 mb-6">Chào mừng bạn đến với trang thông tin cá nhân</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 hover:shadow-lg transition-all">
                        <UserOutlined className="text-4xl text-indigo-500 mb-3" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Hồ sơ</h3>
                        <p className="text-gray-600">Quản lý thông tin cá nhân</p>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 hover:shadow-lg transition-all">
                        <SafetyOutlined className="text-4xl text-green-500 mb-3" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Bảo mật</h3>
                        <p className="text-gray-600">Xác thực tài khoản</p>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 hover:shadow-lg transition-all">
                        <ClockCircleOutlined className="text-4xl text-purple-500 mb-3" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Lịch sử</h3>
                        <p className="text-gray-600">Xem lịch sử thuê xe</p>
                      </Card>
                    </div>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><MailOutlined />Thông tin</span>} key="info">
                  {isEditing ? (
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin</h3>
                        <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)} />
                      </div>
                      <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                          <Input name="userName" value={form.userName || form.name || ""} onChange={handleChange} size="large" prefix={<UserOutlined />} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                          <Input name="email" value={form.email || ""} onChange={handleChange} size="large" prefix={<MailOutlined />} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Xác thực tài khoản</h3>
                  
                  {/* Check if both documents are verified */}
                  {(user.licenseVerified && user.idCardVerified) ? (
                    <div className="verified-state text-center py-8">
                      <CheckCircleOutlined style={{ fontSize: 80, color: "#52c41a" }} />
                      <h3 className="text-2xl font-bold text-green-600 mt-4">✅ Tài khoản đã được xác thực!</h3>
                      <p className="text-gray-600 mt-2">Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.</p>
                      <div className="mt-6 space-y-2">
                        <Tag color="success" className="px-4 py-2 text-base">
                          <CheckCircleOutlined /> Giấy phép lái xe đã xác thực
                        </Tag>
                        <Tag color="success" className="px-4 py-2 text-base ml-2">
                          <CheckCircleOutlined /> CCCD/CMND đã xác thực
                        </Tag>
                      </div>
                      {user.licenseVerifiedAt && (
                        <p className="text-sm text-gray-500 mt-4">
                          Xác thực lúc: {new Date(user.licenseVerifiedAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Show partial verification status */}
                      {(user.licenseVerified || user.idCardVerified) && (
                        <Alert 
                          message="Xác thực một phần" 
                          description={
                            <div>
                              {user.licenseVerified && (
                                <p>✅ Giấy phép lái xe đã được xác thực</p>
                              )}
                              {user.idCardVerified && (
                                <p>✅ CCCD/CMND đã được xác thực</p>
                              )}
                              <p className="mt-2">
                                Vui lòng hoàn tất {!user.licenseVerified ? "giấy phép lái xe" : "CCCD/CMND"} để sử dụng đầy đủ tính năng.
                              </p>
                            </div>
                          }
                          type="info" 
                          showIcon 
                          style={{ marginBottom: 24 }} 
                        />
                      )}
                      
                      {!user.licenseVerified && !user.idCardVerified && (
                        <Alert 
                          message="Tài khoản chưa xác thực" 
                          description="Vui lòng tải lên ảnh Giấy phép lái xe và CCCD/CMND để xác thực tài khoản." 
                          type="warning" 
                          showIcon 
                          style={{ marginBottom: 24 }} 
                        />
                      )}
                      
                      <Card style={{ marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <CarOutlined style={{ fontSize: 24, marginRight: 8 }} />
                            <div>
                              <h4>Giấy phép lái xe</h4>
                              <p>Tải lên ảnh 2 mặt giấy phép lái xe</p>
                            </div>
                          </div>
                          {user.licenseVerified && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                          )}
                        </div>
                        {!user.licenseVerified && (
                          <>
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
                          </>
                        )}
                      </Card>
                      <Card>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <IdcardOutlined style={{ fontSize: 24, marginRight: 8 }} />
                            <div>
                              <h4>CCCD/CMND</h4>
                              <p>Tải lên ảnh 2 mặt CCCD hoặc CMND</p>
                            </div>
                          </div>
                          {user.idCardVerified && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                          )}
                        </div>
                        {!user.idCardVerified && (
                          <Dragger multiple accept="image/*" beforeUpload={() => false} onChange={(info) => {
                            const files = info.fileList.map((f) => f.originFileObj).filter(Boolean);
                          if (files.length > 0) handleFileUpload(files, "idcard");
                        }}>
                          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                          <p className="ant-upload-text">Kéo thả ảnh vào đây hoặc nhấp để chọn</p>
                          <p className="ant-upload-hint">Hỗ trợ tải lên nhiều ảnh. Tối đa 5MB/ảnh.</p>
                        </Dragger>
                        )}
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
                  {myBookings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <ClockCircleOutlined style={{ fontSize: 64, color: "#bbb" }} />
                      <h3>Chưa có lịch sử thuê xe</h3>
                      <p>Bạn chưa có chuyến đi nào được ghi nhận.</p>
                      <Button 
                        type="primary" 
                        size="large"
                        onClick={() => navigate('/vehicles')}
                        style={{ marginTop: 16 }}
                      >
                        <CarOutlined /> Tìm xe ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="booking-history-list">
                      <h3 style={{ marginBottom: 24 }}>Lịch sử thuê xe ({myBookings.length})</h3>
                      {myBookings.map((booking) => (
                        <Card 
                          key={booking.bookingId} 
                          className="booking-history-card"
                          style={{ marginBottom: 16 }}
                        >
                          <div className="booking-card-content">
                            <div className="booking-vehicle-info">
                              <img 
                                src={booking.vehicle?.image || '/placeholder-vehicle.jpg'} 
                                alt={booking.vehicle?.name}
                                style={{
                                  width: 100,
                                  height: 70,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  marginRight: 16
                                }}
                              />
                              <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                                  {booking.vehicle?.name}
                                </h4>
                                <p style={{ margin: '4px 0', color: '#666' }}>
                                  {booking.vehicle?.type || 'Xe điện'}
                                </p>
                                <Tag color={
                                  booking.status === 'confirmed_vehicle' ? 'success' :
                                  booking.status === 'vehicle_preview_sent' ? 'processing' :
                                  booking.status === 'payment_completed' ? 'warning' :
                                  booking.status === 'rental_completed' ? 'default' :
                                  'error'
                                }>
                                  {booking.status === 'confirmed_vehicle' ? 'Đã xác nhận xe' :
                                   booking.status === 'vehicle_preview_sent' ? 'Chờ xác nhận' :
                                   booking.status === 'payment_completed' ? 'Đã thanh toán' :
                                   booking.status === 'rental_completed' ? 'Hoàn thành' :
                                   booking.status}
                                </Tag>
                              </div>
                            </div>
                            
                            <div className="booking-details-grid">
                              <div>
                                <CalendarOutlined style={{ marginRight: 8, color: '#667eea' }} />
                                <strong>Ngày thuê:</strong>
                                <div style={{ marginLeft: 24, color: '#666' }}>
                                  {new Date(booking.bookingData?.startDate).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              <div>
                                <CalendarOutlined style={{ marginRight: 8, color: '#667eea' }} />
                                <strong>Ngày trả:</strong>
                                <div style={{ marginLeft: 24, color: '#666' }}>
                                  {new Date(booking.bookingData?.endDate).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              <div>
                                <HomeOutlined style={{ marginRight: 8, color: '#667eea' }} />
                                <strong>Trạm:</strong>
                                <div style={{ marginLeft: 24, color: '#666' }}>
                                  {booking.bookingData?.pickupLocation}
                                </div>
                              </div>
                              <div>
                                <strong style={{ color: '#667eea', fontSize: '1.1rem' }}>
                                  ${booking.payment?.totalPrice?.toLocaleString() || 0}
                                </strong>
                              </div>
                            </div>

                            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                              {booking.status === 'vehicle_preview_sent' && (
                                <Button 
                                  type="primary"
                                  onClick={() => navigate(`/vehicle-preview/${booking.bookingId}`)}
                                >
                                  Xem thông tin xe
                                </Button>
                              )}
                              {booking.status === 'confirmed_vehicle' && (
                                <Button 
                                  type="primary"
                                  onClick={() => navigate(`/checkin-prepare/${booking.bookingId}`)}
                                >
                                  Chuẩn bị nhận xe
                                </Button>
                              )}
                              <Button onClick={() => navigate(`/booking-details/${booking.bookingId}`)}>
                                Chi tiết
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
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
