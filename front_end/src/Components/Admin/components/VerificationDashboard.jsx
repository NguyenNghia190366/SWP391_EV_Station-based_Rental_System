import { useState, useEffect } from "react";
import { Table, Image, Button, Tag, Space, Modal, Input, message, Tabs, Card, Statistic } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  IdcardOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { driverLicenseAPI, cccdVerificationAPI } from "../../../api/api";

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function VerificationDashboard() {
  const [licenses, setLicenses] = useState([]);
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [currentTab, setCurrentTab] = useState("licenses");

  // Load data on mount
  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);

      // Fetch real data from backend
      const [licensesResponse, idCardsResponse] = await Promise.all([
        driverLicenseAPI.getPending(),
        cccdVerificationAPI.getPending(),
      ]);

      console.log('📊 Licenses Response:', licensesResponse);
      console.log('📊 CCCDs Response:', idCardsResponse);

      // Transform backend data (camelCase) to match component format
      const transformedLicenses = (licensesResponse.data || []).map(item => ({
        driver_license_number: item.id,  // Backend returns camelCase
        renter_id: item.renterId,
        renter_name: item.renterName,
        renter_email: item.renterEmail,
        renter_phone: item.renterPhone || "N/A",
        license_number_text: item.licenseNumber,
        url_image_license: item.frontImageUrl,
        url_image_license_back: item.backImageUrl,
        is_read: item.status !== 0, // 0 = pending (not read yet)
        created_at: item.uploadedAt,
        status: item.status
      }));

      const transformedIdCards = (idCardsResponse.data || []).map(item => ({
        renter_id: item.renterId,
        renter_name: item.renterName,
        renter_email: item.renterEmail,
        renter_phone: item.renterPhone || "N/A",
        id_card_number: item.cccdNumber,
        full_name: item.fullName,
        dob: item.dob,
        address: item.address,
        url_cccd_cmnd: item.frontImageUrl,
        url_cccd_cmnd_back: item.backImageUrl,
        is_read: item.status !== 0, // 0 = pending (not read yet)
        created_at: item.uploadedAt,
        status: item.status,
        verification_id: item.id
      }));

      console.log('✅ Transformed Licenses:', transformedLicenses);
      console.log('✅ Transformed CCCDs:', transformedIdCards);

      setLicenses(transformedLicenses);
      setIdCards(transformedIdCards);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      message.error("Không thể tải dữ liệu xác thực!");
      
      // Fallback to empty arrays on error
      setLicenses([]);
      setIdCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle view image
  const handleViewImage = (record, type) => {
    setSelectedItem({ ...record, type });
    setVerifyModalVisible(true);
    setActionType("");
    setRejectReason("");
  };

  // Handle approve
  const handleApprove = async () => {
    try {
      message.loading({ content: "Đang xác thực...", key: "verify" });

      // Get current staff info from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const staffInfo = {
        StaffId: currentUser.userId || "staff_unknown",
        StaffName: currentUser.fullName || "Unknown Staff"
      };

      // Call real API based on document type
      if (selectedItem.type === "license") {
        await driverLicenseAPI.approve(selectedItem.driver_license_number, staffInfo);
        // Remove from local state
        setLicenses((prev) =>
          prev.filter((item) => item.driver_license_number !== selectedItem.driver_license_number)
        );
      } else {
        await cccdVerificationAPI.approve(selectedItem.verification_id, staffInfo);
        // Remove from local state
        setIdCards((prev) => 
          prev.filter((item) => item.verification_id !== selectedItem.verification_id)
        );
      }

      message.success({ content: "✅ Xác thực thành công!", key: "verify" });
      setVerifyModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Approve error:", error);
      message.error({ content: "❌ Xác thực thất bại: " + error.message, key: "verify" });
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      message.loading({ content: "Đang từ chối...", key: "reject" });

      // Get current staff info from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const rejectData = {
        StaffId: currentUser.userId || "staff_unknown",
        StaffName: currentUser.fullName || "Unknown Staff",
        Reason: rejectReason.trim()
      };

      // Call real API based on document type
      if (selectedItem.type === "license") {
        await driverLicenseAPI.reject(selectedItem.driver_license_number, rejectData);
        // Remove from local state
        setLicenses((prev) =>
          prev.filter((item) => item.driver_license_number !== selectedItem.driver_license_number)
        );
      } else {
        await cccdVerificationAPI.reject(selectedItem.verification_id, rejectData);
        // Remove from local state
        setIdCards((prev) => 
          prev.filter((item) => item.verification_id !== selectedItem.verification_id)
        );
      }

      message.success({ content: "✅ Đã từ chối và gửi thông báo!", key: "reject" });
      setVerifyModalVisible(false);
      setSelectedItem(null);
      setRejectReason("");
    } catch (error) {
      console.error("Reject error:", error);
      message.error({ content: "❌ Từ chối thất bại: " + error.message, key: "reject" });
    }
  };

  // License columns
  const licenseColumns = [
    {
      title: "Mã GPLX",
      dataIndex: "driver_license_number",
      key: "driver_license_number",
      width: 120,
    },
    {
      title: "Người thuê",
      key: "renter",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.renter_name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.renter_email}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.renter_phone}</div>
        </div>
      ),
    },
    {
      title: "Hình ảnh GPLX",
      key: "image",
      render: (_, record) => (
        <Image
          src={record.url_image_license}
          alt="Driver License"
          width={100}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: "Ngày tải lên",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === 1) {
          return <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>;
        } else if (status === 0) {
          return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
        } else {
          return <Tag color="warning">Chờ duyệt</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewImage(record, "license")}
            disabled={record.status !== 0}
          >
            {record.status === 0 ? 'Xem & Xác thực' : 'Xem chi tiết'}
          </Button>
        </Space>
      ),
    },
  ];

  // ID Card columns
  const idCardColumns = [
    {
      title: "Số CCCD/CMND",
      dataIndex: "id_card_number",
      key: "id_card_number",
      width: 150,
    },
    {
      title: "Người thuê",
      key: "renter",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.renter_name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.renter_email}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.renter_phone}</div>
        </div>
      ),
    },
    {
      title: "Hình ảnh CCCD",
      key: "image",
      render: (_, record) => (
        <Image
          src={record.url_cccd_cmnd}
          alt="ID Card"
          width={100}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: "Ngày tải lên",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === 1) {
          return <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác thực</Tag>;
        } else if (status === 0) {
          return <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
        } else {
          return <Tag color="warning">Chờ duyệt</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewImage(record, "idcard")}
            disabled={record.status !== 0}
          >
            {record.status === 0 ? 'Xem & Xác thực' : 'Xem chi tiết'}
          </Button>
        </Space>
      ),
    },
  ];

  // Statistics
  const pendingLicenses = licenses.filter((l) => !l.is_read).length;
  const pendingIdCards = idCards.filter((i) => !i.is_read).length;

  return (
    <div className="staff-verification-dashboard overflow-hidden w-full">
      <div className="dashboard-header">
        <h1>🔒 Xác Thực Giấy Tờ</h1>
        <p>Quản lý và xác thực giấy phép lái xe, CCCD/CMND của người thuê</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <Card>
          <Statistic
            title="Tổng GPLX chờ xác thực"
            value={pendingLicenses}
            prefix={<CarOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng CCCD chờ xác thực"
            value={pendingIdCards}
            prefix={<IdcardOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng cần xử lý"
            value={pendingLicenses + pendingIdCards}
            prefix={<UserOutlined />}
            valueStyle={{ color: "#f5222d" }}
          />
        </Card>
      </div>

      {/* Tabs */}
      <Tabs activeKey={currentTab} onChange={setCurrentTab} size="large">
        <TabPane
          tab={
            <span>
              <CarOutlined />
              Giấy phép lái xe ({licenses.length})
            </span>
          }
          key="licenses"
        >
          {/* Wrap table in a horizontally-scrollable container so it won't overflow parent's rounded corners */}
          <div className="overflow-x-auto rounded-lg max-w-full">
            <Table
              columns={licenseColumns}
              dataSource={licenses}
              rowKey="driver_license_number"
              loading={loading}
              pagination={{ pageSize: 10 }}
              // Use minWidth on table instead of forcing global scroll to avoid page overflow
              className="min-w-[900px]"
            />
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <IdcardOutlined />
              CCCD/CMND ({idCards.length})
            </span>
          }
          key="idcards"
        >
          {/* Wrap table to keep overflow contained */}
          <div className="overflow-x-auto rounded-lg max-w-full">
            <Table
              columns={idCardColumns}
              dataSource={idCards}
              rowKey="renter_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              className="min-w-[900px]"
            />
          </div>
        </TabPane>
      </Tabs>

      {/* Verification Modal */}
      <Modal
        title={
          selectedItem?.type === "license"
            ? " Xác thực Giấy phép lái xe"
            : " Xác thực CCCD/CMND"
        }
        open={verifyModalVisible}
        onCancel={() => {
          setVerifyModalVisible(false);
          setSelectedItem(null);
          setActionType("");
          setRejectReason("");
        }}
        width={800}
        footer={null}
      >
        {selectedItem && (
          <div className="verification-modal-content">
            {/* User Info */}
            <Card title="Thông tin người thuê" style={{ marginBottom: 16 }}>
              <p>
                <strong>Họ tên:</strong> {selectedItem.renter_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedItem.renter_email}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {selectedItem.renter_phone}
              </p>
              <p>
                <strong>
                  {selectedItem.type === "license" ? "Số GPLX:" : "Số CCCD/CMND:"}
                </strong>{" "}
                {selectedItem.type === "license"
                  ? selectedItem.driver_license_number
                  : selectedItem.id_card_number}
              </p>
              <p>
                <strong>Ngày tải lên:</strong>{" "}
                {new Date(selectedItem.created_at).toLocaleString("vi-VN")}
              </p>
            </Card>

            {/* Image Display */}
            <Card title="Hình ảnh giấy tờ" style={{ marginBottom: 16 }}>
              <Image
                src={
                  selectedItem.type === "license"
                    ? selectedItem.url_image_license
                    : selectedItem.url_cccd_cmnd
                }
                alt="Document"
                width="100%"
                style={{ borderRadius: 8 }}
              />
            </Card>

            {/* Action Buttons */}
            {actionType === "" && (
              <Space style={{ width: "100%", justifyContent: "center" }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                  style={{ minWidth: 150 }}
                >
                  Xác thực
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={() => setActionType("reject")}
                  style={{ minWidth: 150 }}
                >
                  Từ chối
                </Button>
              </Space>
            )}

            {/* Reject Reason Input */}
            {actionType === "reject" && (
              <div style={{ marginTop: 16 }}>
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối (bắt buộc)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ marginBottom: 16 }}
                />
                <Space style={{ width: "100%", justifyContent: "center" }}>
                  <Button onClick={() => setActionType("")}>Hủy</Button>
                  <Button type="primary" danger onClick={handleReject}>
                    Xác nhận từ chối
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
