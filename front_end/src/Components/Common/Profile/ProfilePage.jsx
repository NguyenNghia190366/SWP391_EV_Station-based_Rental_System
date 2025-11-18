import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import {
  UserOutlined, SafetyOutlined, ClockCircleOutlined, DashboardOutlined,
  EditOutlined, SaveOutlined, CloseOutlined, CarOutlined, LoadingOutlined, DeleteOutlined
} from "@ant-design/icons";
import {
  Button, Input, Card, Tag, Avatar, message, Modal, Spin, Menu, Table, Space, Popconfirm, Tooltip
} from "antd";
import PaymentHistory from "@/pages/renter/payment/PaymentHistory";
import dayjs from "dayjs";
import { useUsers } from "@/hooks/useUsers";
import { useDriverLicense } from "@/hooks/useDriverLicense";
import { useCccd } from "@/hooks/useCccd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useRenters } from "@/hooks/useRenters";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import VerifyPage from "@/pages/renter/VerifyPage";
import RentalHistoryPage from "@/pages/renter/RentalHistoryPage";

const ProfilePage = () => {
  const navigate = useNavigate();
  const instance = useAxiosInstance();
  const { getRenterIdByUserId } = useRenters();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [licenseImages, setLicenseImages] = useState([]);
  const [idCardImages, setIdCardImages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const { updateProfile, uploadAvatar } = useUsers();
  const { updateStatus: updateLicenseStatus } = useDriverLicense();
  const { updateStatus: updateCcqdStatus } = useCccd();
  const { updateRentalOrderStatus } = useRentalOrders();

  const [selectedMenu, setSelectedMenu] = useState('info');

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
        message.warning("User ID not found!");
        return;
      }

      const renterId = await getRenterIdByUserId(userId);
      const [rentalOrdersRes, vehiclesRes, stationsRes] = await Promise.all([
        instance.get(`/RentalOrders?renter_id=${renterId}`),
        instance.get("/Vehicles"),
        instance.get("/Stations"),
      ]);

      const rentalOrdersRaw = Array.isArray(rentalOrdersRes.data)
        ? rentalOrdersRes.data
        : rentalOrdersRes.data?.data || [];

      // Filter on frontend by renterId to make sure user only sees their own orders
      const rentalOrders = rentalOrdersRaw.filter((o) => {
        const ownerId = o.renterId ?? o.renter_id ?? o.RenterId ?? o.Renter_Id ?? o.renter;
        return String(ownerId) === String(renterId);
      });

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
      console.error("❌ Error loading rental history:", err);
      message.error("Cannot load rental history!");
    } finally {
      setBookingsLoading(false);
    }
  };

  // ===== Cancel order (renter) =====
  const handleCancelOrder = async (record) => {
    if (!record) return;
    // If already approved - don't allow cancellation by renter
    if (record.status === "APPROVED") {
      message.warning("Order approved, cannot cancel from renter side.");
      return;
    }

    if (cancellingId) return;
    setCancellingId(record.orderId);
    try {
      // Pass full record as orderData so backend receives existing fields
      await updateRentalOrderStatus(record.orderId, "CANCELED", record);
      message.success("Order canceled!");
      // refresh history
      setTimeout(() => fetchRentalHistory(), 400);
    } catch (err) {
      console.error("❌ Error cancelling order:", err);
      message.error("Order cancellation failed. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  // ===== Update user =====
  const handleUpdateUser = async (updated) => {
    try {
      // Yup validation schema for profile update
      const profileSchema = yup.object({
        fullName: yup
          .string()
          .required("Please enter full name!")
          .min(2, "Full name must be at least 2 characters!"),
        email: yup
          .string()
          .required("Please enter email!")
          .email("Invalid email!"),
        phone_number: yup
          .string()
          .required("Please enter phone number!")
          .matches(/^[0-9]{10}$/, "Phone number must be 10 digits!"),
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
      message.loading({ content: "Updating...", key: "update" });
      const res = await updateProfile(userId, updated);
      localStorage.setItem("currentUser", JSON.stringify(res));
      setUser(res);
      message.success({ content: "Update successful!", key: "update" });
    } catch (err) {
      console.error("❌ Update profile error:", err);
      message.error("Update failed!");
    }
  };

  // ===== Update avatar =====
  const handleUpdateAvatar = async (file) => {
    if (!file || !file.type.startsWith("image/")) return message.error("Only image files are allowed!");
    if (file.size > 5 * 1024 * 1024) return message.error("Maximum 5MB allowed!");
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = { ...user, avatar: reader.result };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      message.success("Avatar updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  // ===== Upload documents =====
  const handleUploadFiles = async (files, apiFunc, type) => {
    if (!files?.length) return message.warning("No image selected!");
    message.loading({ content: `Loading ${type}...`, key: type });
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
    message.success({ content: `${type} uploaded successfully!`, key: type });
  };

  const handleSubmitVerification = async (licenseFiles, idCardFiles) => {
    if (!licenseFiles?.length && !idCardFiles?.length)
      return message.warning("Please upload at least 1 document!");
    const { uploadDriverLicense } = useDriverLicense();
    const { uploadCccd } = useCccd();
    await Promise.all([
      licenseFiles?.length && handleUploadFiles(licenseFiles, uploadDriverLicense, "license"),
      idCardFiles?.length && handleUploadFiles(idCardFiles, uploadCccd, "cccd")
    ]);
    message.success("Verification documents submitted!");
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
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><UserOutlined />Personal Information</h2>
      {isEditing ? (
        <div className="space-y-4">
          <Input name="fullName" placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
          <Input name="phone_number" placeholder="Phone number" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
          <div className="flex gap-2 mt-4">
            <Button type="primary" onClick={() => { handleUpdateUser(form); setIsEditing(false); }}><SaveOutlined /> Save</Button>
            <Button onClick={() => setIsEditing(false)}><CloseOutlined /> Cancel</Button>
          </div>
        </div>
      ) : (
        <div>
          <p><b>Full name:</b> {user.fullName || "N/A"}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Phone:</b> {user.phone || user.phone_number || "Not updated"}</p>
          <Tag color="purple">{user.role || "RENTER"}</Tag>
          <Button className="mt-3" onClick={() => { setIsEditing(true); setForm(user); }}><EditOutlined /> Edit</Button>
        </div>
      )}
    </Card>
  );

  const renderVerify = () => (
    <Card className="shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><SafetyOutlined />Document Verification</h2>
      <VerifyPage />
    </Card>
  );

  const renderHistory = () => {
    const historyColumns = [
      {
        title: "Order ID",
        dataIndex: "orderId",
        key: "orderId",
        render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
      },
      {
            title: "Vehicle",
        dataIndex: "vehicleName",
        key: "vehicleName",
      },
      {
        title: "Stations (pickup → return)",
        key: "stations",
        render: (_, record) => (
          <span>{record.pickupStationName} → {record.returnStationName}</span>
        ),
      },
      {
        title: "Rental time",
        key: "rentalTime",
        render: (_, record) => (
          <span>
            {dayjs(record.startTime).format("DD/MM HH:mm")} →{" "}
            {dayjs(record.endTime).format("DD/MM HH:mm")}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
            const statusMap = {
            BOOKED: { color: "blue", text: "Pending" },
            APPROVED: { color: "green", text: "Approved" },
            CANCELED: { color: "red", text: "Canceled" },
            IN_USE: { color: "orange", text: "In use" },
            COMPLETED: { color: "cyan", text: "Completed" },
          };
          const statusInfo = statusMap[status] || { color: "default", text: status };
          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
        },
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => {
          // show cancel for BOOKED and APPROVED (disabled when APPROVED)
          const showCancel = record.status === "BOOKED" || record.status === "APPROVED";
          const disabled = record.status === "APPROVED";
          if (!showCancel) return null;

          return (
            <Space>
                <Popconfirm
                title={disabled ? "Order approved, cannot cancel." : "Confirm cancellation?"}
                onConfirm={() => handleCancelOrder(record)}
                okText="Yes"
                cancelText="No"
                disabled={disabled}
              >
                <Tooltip title={disabled ? "Approved — cannot cancel" : "Cancel order"}>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={cancellingId === record.orderId}
                    disabled={disabled || cancellingId === record.orderId}
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];

    return (
      <Card className="shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ClockCircleOutlined />Booking History</h2>
        {bookingsLoading ? (
          <Spin tip="Loading history..." />
        ) : myBookings.length > 0 ? (
          <Table
            columns={historyColumns}
            dataSource={myBookings}
            rowKey="orderId"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        ) : (
          <div className="text-center py-6">
            <CarOutlined style={{ fontSize: 40, color: "#bbb" }} />
            <p>No booking history</p>
              <Button type="primary" onClick={() => navigate("/vehicles")}>Book now</Button>
          </div>
        )}
      </Card>
    );
  };

  if (loading)
    return <div className="flex justify-center items-center h-screen"><Spin indicator={<LoadingOutlined spin />} /></div>;
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-6">
          <UserOutlined className="text-4xl mb-3" />
          <h3>Please log in to view profile</h3>
          <Button type="primary" onClick={() => navigate("/login")}>Log in</Button>
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
          <Button onClick={() => document.getElementById("avatar-input").click()} size="small" className="mt-2">Change avatar</Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          items={[
                { key: "info", icon: <UserOutlined />, label: "Personal Information" },
                { key: "verify", icon: <SafetyOutlined />, label: "Document Verification" },
                { key: "history", icon: <ClockCircleOutlined />, label: "Booking History" },
                { key: "payments", icon: <DashboardOutlined />, label: "Payment History" },
              ]}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
  {selectedMenu === "info" && renderInfo()}
  {selectedMenu === "verify" && renderVerify()}
  {selectedMenu === "history" && <RentalHistoryPage />}
  {selectedMenu === "payments" && <PaymentHistory />}
      </div>

      {/* Avatar Modal */}
      <Modal
        title="Confirm Avatar Image"
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
