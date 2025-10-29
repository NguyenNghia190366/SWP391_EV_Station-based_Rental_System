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
// eslint-disable-next-line no-unused-vars
import { driverLicenseAPI, cccdVerificationAPI } from "../../api/api";
import "./StaffVerificationDashboard.css";

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function StaffVerificationDashboard() {
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

      // OPTION 1: Use real API (when backend is ready)
      // const licensesData = await driverLicenseAPI.getPending();
      // const idCardsData = await cccdVerificationAPI.getPending();
      // setLicenses(licensesData);
      // setIdCards(idCardsData);

      // OPTION 2: Mock data for now (remove when backend is ready)
      const mockLicenses = [
        {
          driver_license_number: "DL001",
          renter_id: 1,
          renter_name: "Nguyen Van A",
          renter_email: "nguyenvana@email.com",
          renter_phone: "0123456789",
          url_image_license: "https://via.placeholder.com/400x250?text=Driver+License+Front",
          is_read: false,
          created_at: "2025-10-28T10:30:00",
        },
        {
          driver_license_number: "DL002",
          renter_id: 2,
          renter_name: "Tran Thi B",
          renter_email: "tranthib@email.com",
          renter_phone: "0987654321",
          url_image_license: "https://via.placeholder.com/400x250?text=Driver+License+Back",
          is_read: true,
          created_at: "2025-10-27T14:20:00",
        },
      ];

      const mockIdCards = [
        {
          renter_id: 1,
          renter_name: "Nguyen Van A",
          renter_email: "nguyenvana@email.com",
          renter_phone: "0123456789",
          id_card_number: "123456789012",
          url_cccd_cmnd: "https://via.placeholder.com/400x250?text=ID+Card+Front",
          is_read: false,
          created_at: "2025-10-28T10:35:00",
        },
        {
          renter_id: 3,
          renter_name: "Le Van C",
          renter_email: "levanc@email.com",
          renter_phone: "0912345678",
          id_card_number: "987654321098",
          url_cccd_cmnd: "https://via.placeholder.com/400x250?text=ID+Card+Back",
          is_read: true,
          created_at: "2025-10-26T09:15:00",
        },
      ];

      setLicenses(mockLicenses);
      setIdCards(mockIdCards);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      message.error("Không thể tải dữ liệu xác thực!");
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

      // OPTION 1: Use real API (when backend is ready)
      // if (selectedItem.type === 'license') {
      //   await driverLicenseAPI.approve(selectedItem.driver_license_number);
      // } else {
      //   await cccdVerificationAPI.approve(selectedItem.renter_id);
      // }

      // OPTION 2: Mock success (remove when backend is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      if (selectedItem.type === "license") {
        setLicenses((prev) =>
          prev.filter((item) => item.driver_license_number !== selectedItem.driver_license_number)
        );
      } else {
        setIdCards((prev) => prev.filter((item) => item.renter_id !== selectedItem.renter_id));
      }

      message.success({ content: " Xác thực thành công!", key: "verify" });
      setVerifyModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Approve error:", error);
      message.error({ content: " Xác thực thất bại!", key: "verify" });
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

      // OPTION 1: Use real API (when backend is ready)
      // if (selectedItem.type === 'license') {
      //   await driverLicenseAPI.reject(selectedItem.driver_license_number, rejectReason);
      // } else {
      //   await cccdVerificationAPI.reject(selectedItem.renter_id, rejectReason);
      // }

      // OPTION 2: Mock success (remove when backend is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      if (selectedItem.type === "license") {
        setLicenses((prev) =>
          prev.filter((item) => item.driver_license_number !== selectedItem.driver_license_number)
        );
      } else {
        setIdCards((prev) => prev.filter((item) => item.renter_id !== selectedItem.renter_id));
      }

      message.success({ content: " Đã từ chối và gửi thông báo!", key: "reject" });
      setVerifyModalVisible(false);
      setSelectedItem(null);
      setRejectReason("");
    } catch (error) {
      console.error("Reject error:", error);
      message.error({ content: " Từ chối thất bại!", key: "reject" });
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
      dataIndex: "is_read",
      key: "is_read",
      render: (isRead) =>
        isRead ? (
          <Tag color="blue">Đã xem</Tag>
        ) : (
          <Tag color="red">Chưa xem</Tag>
        ),
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
          >
            Xem & Xác thực
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
      dataIndex: "is_read",
      key: "is_read",
      render: (isRead) =>
        isRead ? (
          <Tag color="blue">Đã xem</Tag>
        ) : (
          <Tag color="red">Chưa xem</Tag>
        ),
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
          >
            Xem & Xác thực
          </Button>
        </Space>
      ),
    },
  ];

  // Statistics
  const pendingLicenses = licenses.filter((l) => !l.is_read).length;
  const pendingIdCards = idCards.filter((i) => !i.is_read).length;

  return (
    <div className="staff-verification-dashboard">
      <div className="dashboard-header">
        <h1> Xác Thực Giấy Tờ</h1>
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
          <Table
            columns={licenseColumns}
            dataSource={licenses}
            rowKey="driver_license_number"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
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
          <Table
            columns={idCardColumns}
            dataSource={idCards}
            rowKey="renter_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
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
