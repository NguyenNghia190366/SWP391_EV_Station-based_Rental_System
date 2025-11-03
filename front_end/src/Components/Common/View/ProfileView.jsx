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
import { cloudinaryAPI } from "../../../api/useFile";


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

  // Menu items
  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "info",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "verify",
      icon: <SafetyOutlined />,
      label: "Xác minh giấy tờ",
    },
    {
      key: "history",
      icon: <ClockCircleOutlined />,
      label: "Lịch sử đặt xe",
    },
  ];

  // Load bookings from localStorage
  useEffect(() => {
    const loadBookings = () => {
      try {
        const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
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

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Tổng quan Profile</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Số chuyến đã đặt"
                  value={myBookings.length}
                  prefix={<CarOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Trạng thái xác thực"
                  value={user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                  prefix={<SafetyOutlined className={user.isVerified ? "text-green-500" : "text-orange-500"} />}
                  valueStyle={{ color: user.isVerified ? '#52c41a' : '#fa8c16', fontSize: '1.2rem' }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Thành viên từ"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                  prefix={<CalendarOutlined className="text-purple-500" />}
                  valueStyle={{ fontSize: '1rem' }}
                />
              </Card>
            </div>

            {/* User Info Card */}
            <Card className="shadow-md">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar 
                    size={120} 
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    className="border-4 border-white shadow-xl"
                  />
                  {user.isVerified && (
                    <CheckCircleOutlined className="absolute bottom-0 right-0 text-2xl text-green-500 bg-white rounded-full" />
                  )}
                  <label 
                    htmlFor="avatar-input" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                  >
                    <CameraOutlined className="text-white text-2xl" />
                  </label>
                  <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{user.userName || user.name || "Người dùng"}</h3>
                  <Tag color="purple" className="mt-2">{user.role || "RENTER"}</Tag>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MailOutlined className="text-indigo-500" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <PhoneOutlined className="text-indigo-500" />
                      <span>{user.phoneNumber || user.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Card>
        );

      case "info":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserOutlined className="text-blue-500" />
                Thông tin cá nhân
              </h2>
              <p className="text-gray-600 mt-2">
                Quản lý thông tin tài khoản của bạn
              </p>
            </div>
            
            {isEditing ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa thông tin</h3>
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
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Chi tiết thông tin</h3>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-50">
                    <MailOutlined className="text-2xl text-indigo-500 mb-2" />
                    <span className="block text-sm text-gray-600 mb-1">Email</span>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </Card>
                  <Card className="bg-gray-50">
                    <PhoneOutlined className="text-2xl text-indigo-500 mb-2" />
                    <span className="block text-sm text-gray-600 mb-1">Số điện thoại</span>
                    <p className="text-lg font-semibold text-gray-900">{user.phoneNumber || user.phone || "Chưa cập nhật"}</p>
                  </Card>
                  <Card className="bg-gray-50">
                    <CalendarOutlined className="text-2xl text-indigo-500 mb-2" />
                    <span className="block text-sm text-gray-600 mb-1">Ngày tạo tài khoản</span>
                    <p className="text-lg font-semibold text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</p>
                  </Card>
                  <Card className="bg-gray-50">
                    <SafetyOutlined className="text-2xl text-indigo-500 mb-2" />
                    <span className="block text-sm text-gray-600 mb-1">Trạng thái xác thực</span>
                    {user.isVerified ? (
                      <Tag color="success" icon={<CheckCircleOutlined />} className="text-base">Đã xác thực</Tag>
                    ) : (
                      <Tag color="warning" icon={<WarningOutlined />} className="text-base">Chưa xác thực</Tag>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </Card>
        );

      case "verify":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <SafetyOutlined className="text-green-500" />
                Xác minh giấy tờ
              </h2>
              <p className="text-gray-600 mt-2">
                Tải lên giấy tờ để xác thực tài khoản và sử dụng đầy đủ dịch vụ
              </p>
            </div>
            
            {/* Check if both documents are verified */}
            {(user.licenseVerified && user.idCardVerified) ? (
              <div className="text-center py-8">
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
              </div>
            ) : (
              <div className="space-y-6">
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
                  />
                )}
                
                {!user.licenseVerified && !user.idCardVerified && (
                  <Alert 
                    message="Tài khoản chưa xác thực" 
                    description="Vui lòng tải lên ảnh Giấy phép lái xe và CCCD/CMND để xác thực tài khoản." 
                    type="warning" 
                    showIcon 
                  />
                )}
                
                <Card className="shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CarOutlined className="text-2xl text-blue-500" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Giấy phép lái xe</h4>
                        <p className="text-sm text-gray-600">Tải lên ảnh 2 mặt giấy phép lái xe</p>
                      </div>
                    </div>
                    {user.licenseVerified && (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                    )}
                  </div>
                  {!user.licenseVerified && (
                    <>
                      <Dragger 
                        multiple 
                        accept="image/*" 
                        beforeUpload={() => false} 
                        onChange={(info) => {
                          const files = info.fileList.map((f) => f.originFileObj).filter(Boolean);
                          if (files.length > 0) handleFileUpload(files, "license");
                        }}
                      >
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
                
                <Card className="shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <IdcardOutlined className="text-2xl text-purple-500" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">CCCD/CMND</h4>
                        <p className="text-sm text-gray-600">Tải lên ảnh 2 mặt CCCD hoặc CMND</p>
                      </div>
                    </div>
                    {user.idCardVerified && (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>
                    )}
                  </div>
                  {!user.idCardVerified && (
                    <>
                      <Dragger 
                        multiple 
                        accept="image/*" 
                        beforeUpload={() => false} 
                        onChange={(info) => {
                          const files = info.fileList.map((f) => f.originFileObj).filter(Boolean);
                          if (files.length > 0) handleFileUpload(files, "idcard");
                        }}
                      >
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
                    </>
                  )}
                </Card>
                
                {(licenseImages.length > 0 || idCardImages.length > 0) && (
                  <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleSubmitVerificationClick} block>
                    Gửi ảnh xác thực ({licenseImages.length + idCardImages.length} ảnh)
                  </Button>
                )}
              </div>
            )}
          </Card>
        );

      case "history":
        return (
          <Card className="shadow-lg" style={{ minHeight: '500px' }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <ClockCircleOutlined className="text-orange-500" />
                Lịch sử đặt xe
              </h2>
              <p className="text-gray-600 mt-2">
                Xem lại các chuyến thuê xe của bạn
              </p>
            </div>
            
            {myBookings.length === 0 ? (
              <div className="text-center py-12">
                <ClockCircleOutlined style={{ fontSize: 64, color: "#bbb" }} />
                <h3 className="text-xl font-bold text-gray-700 mt-4">Chưa có lịch sử thuê xe</h3>
                <p className="text-gray-600 mt-2">Bạn chưa có chuyến đi nào được ghi nhận.</p>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<CarOutlined />}
                  onClick={() => navigate('/vehicles')}
                  style={{ marginTop: 16 }}
                >
                  Tìm xe ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Tổng số chuyến: <strong>{myBookings.length}</strong></p>
                {myBookings.map((booking) => (
                  <Card 
                    key={booking.bookingId} 
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img 
                        src={booking.vehicle?.image || '/placeholder-vehicle.jpg'} 
                        alt={booking.vehicle?.name}
                        style={{
                          width: 120,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {booking.vehicle?.name}
                            </h4>
                            <p className="text-gray-600">
                              {booking.vehicle?.type || 'Xe điện'}
                            </p>
                          </div>
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
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <CalendarOutlined className="text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-600">Ngày thuê:</span>
                            <div className="text-gray-900 font-semibold">
                              {new Date(booking.bookingData?.startDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div>
                            <CalendarOutlined className="text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-600">Ngày trả:</span>
                            <div className="text-gray-900 font-semibold">
                              {new Date(booking.bookingData?.endDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div>
                            <HomeOutlined className="text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-600">Trạm:</span>
                            <div className="text-gray-900 font-semibold">
                              {booking.bookingData?.pickupLocation}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Tổng tiền:</span>
                            <div className="text-indigo-600 font-bold text-lg">
                              ${booking.payment?.totalPrice?.toLocaleString() || 0}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        );

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
          width: '280px',
          minWidth: '280px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
        }}
      >
        {/* User Card Header */}
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
            style={{
              fontSize: "16px",
              fontWeight: "500",
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {renderContent()}
      </div>

      {/* Avatar Upload Modal */}
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