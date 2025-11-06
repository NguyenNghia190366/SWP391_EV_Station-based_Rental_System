import React, { useState } from "react";
import { Table, Image, Button, Tag, Space, Modal, Card, Avatar, Descriptions, Tabs } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  IdcardOutlined,
  CarOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const RenterListTable = ({ renters, loading, error, onVerify }) => {
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (error) return <p className="text-red-500">{error}</p>;

  // Mở modal xem chi tiết
  const handleViewDetails = (renter) => {
    setSelectedRenter(renter);
    setModalVisible(true);
  };

  // Xác thực renter
  const handleVerifyClick = async (id) => {
    await onVerify(id);
    setModalVisible(false);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
    },
    {
      title: "Thông tin người thuê",
      key: "renter_info",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={48} icon={<UserOutlined />} className="bg-gradient-to-r from-blue-500 to-purple-500" />
          <div>
            <div className="font-semibold text-gray-800">{record.fullName}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <MailOutlined className="text-xs" />
              {record.email}
            </div>
            {record.phone && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <PhoneOutlined className="text-xs" />
                {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Giấy phép lái xe",
      key: "driver_license",
      align: "center",
      render: (_, record) => {
        const hasLicense = record.driverLicenseFrontUrl || record.driverLicenseBackUrl;
        return hasLicense ? (
          <Space direction="vertical" size="small">
            {record.driverLicenseFrontUrl && (
              <Image
                src={record.driverLicenseFrontUrl}
                alt="GPLX Mặt trước"
                width={80}
                height={50}
                style={{ objectFit: "cover", borderRadius: 4 }}
                preview={{
                  mask: <EyeOutlined />,
                }}
              />
            )}
            <Tag icon={<CarOutlined />} color="blue">
              GPLX
            </Tag>
          </Space>
        ) : (
          <Tag color="default">Chưa có</Tag>
        );
      },
    },
    {
      title: "Căn cước công dân",
      key: "cccd",
      align: "center",
      render: (_, record) => {
        const hasCCCD = record.cccdFrontUrl || record.cccdBackUrl;
        return hasCCCD ? (
          <Space direction="vertical" size="small">
            {record.cccdFrontUrl && (
              <Image
                src={record.cccdFrontUrl}
                alt="CCCD Mặt trước"
                width={80}
                height={50}
                style={{ objectFit: "cover", borderRadius: 4 }}
                preview={{
                  mask: <EyeOutlined />,
                }}
              />
            )}
            <Tag icon={<IdcardOutlined />} color="green">
              CCCD
            </Tag>
          </Space>
        ) : (
          <Tag color="default">Chưa có</Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isVerified",
      key: "isVerified",
      align: "center",
      render: (isVerified) =>
        isVerified ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã xác thực
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="warning">
            Chờ duyệt
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Xem chi tiết
          </Button>
          {!record.isVerified && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleVerifyClick(record.id)}
              loading={loading}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
              size="small"
            >
              Xác thực
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-hidden w-full">
      <div className="overflow-x-auto rounded-lg max-w-full">
        <Table
          columns={columns}
          dataSource={renters}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} người thuê`,
          }}
          className="min-w-[1100px]"
        />
      </div>

      {/* Modal xem chi tiết */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span>Chi tiết người thuê</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={
          selectedRenter && !selectedRenter.isVerified ? (
            <Space>
              <Button onClick={() => setModalVisible(false)}>Đóng</Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleVerifyClick(selectedRenter.id)}
                loading={loading}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                ✅ Xác thực người thuê
              </Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => setModalVisible(false)}>
              Đóng
            </Button>
          )
        }
      >
        {selectedRenter && (
          <div>
            {/* Thông tin cá nhân */}
            <Card title="📋 Thông tin cá nhân" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="ID">{selectedRenter.id}</Descriptions.Item>
                <Descriptions.Item label="Họ tên">{selectedRenter.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedRenter.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedRenter.phone || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  {selectedRenter.isVerified ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Đã xác thực
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="warning">
                      Chờ duyệt
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Giấy tờ */}
            <Card title="📄 Giấy tờ tùy thân">
              <Tabs defaultActiveKey="1">
                {/* Tab GPLX */}
                <TabPane
                  tab={
                    <span>
                      <CarOutlined />
                      Giấy phép lái xe
                    </span>
                  }
                  key="1"
                >
                  {selectedRenter.driverLicenseFrontUrl || selectedRenter.driverLicenseBackUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRenter.driverLicenseFrontUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Mặt trước</h4>
                          <Image
                            src={selectedRenter.driverLicenseFrontUrl}
                            alt="GPLX Mặt trước"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                      {selectedRenter.driverLicenseBackUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Mặt sau</h4>
                          <Image
                            src={selectedRenter.driverLicenseBackUrl}
                            alt="GPLX Mặt sau"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CarOutlined style={{ fontSize: 48 }} />
                      <p className="mt-2">Chưa có giấy phép lái xe</p>
                    </div>
                  )}
                </TabPane>

                {/* Tab CCCD */}
                <TabPane
                  tab={
                    <span>
                      <IdcardOutlined />
                      Căn cước công dân
                    </span>
                  }
                  key="2"
                >
                  {selectedRenter.cccdFrontUrl || selectedRenter.cccdBackUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRenter.cccdFrontUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Mặt trước</h4>
                          <Image
                            src={selectedRenter.cccdFrontUrl}
                            alt="CCCD Mặt trước"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                      {selectedRenter.cccdBackUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Mặt sau</h4>
                          <Image
                            src={selectedRenter.cccdBackUrl}
                            alt="CCCD Mặt sau"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <IdcardOutlined style={{ fontSize: 48 }} />
                      <p className="mt-2">Chưa có căn cước công dân</p>
                    </div>
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RenterListTable;
