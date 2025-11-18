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

const RenterListTable = ({ renters, loading, error, onVerify, onReject }) => {
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (error) return <p className="text-red-500">{error}</p>;

  // Check if both driver license and national ID are available
  const hasAllDocuments = (renter) => {
    const hasLicense = renter.driverLicenseFrontUrl || renter.driverLicenseBackUrl;
    const hasCCCD = renter.cccdFrontUrl || renter.cccdBackUrl;
    return hasLicense && hasCCCD;
  };

  // Open details modal
  const handleViewDetails = (renter) => {
    setSelectedRenter(renter);
    setModalVisible(true);
  };

  // Verify renter
  const handleVerifyClick = async (id) => {
    await onVerify(id);
    setModalVisible(false);
  };

  // Reject renter
  const handleRejectClick = async () => {
    if (!selectedRenter) return;
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection!");
      return;
    }
    if (onReject) {
      await onReject(selectedRenter.id, rejectReason);
      setRejectModalVisible(false);
      setRejectReason("");
      setModalVisible(false);
    }
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
      title: "Renter details",
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
      title: "Driver license",
      key: "driver_license",
      align: "center",
      render: (_, record) => {
        const hasLicense = record.driverLicenseFrontUrl || record.driverLicenseBackUrl;
        return hasLicense ? (
          <Space direction="vertical" size="small">
            {record.driverLicenseFrontUrl && (
              <Image
                src={record.driverLicenseFrontUrl}
                alt="Driver license front"
                width={80}
                height={50}
                style={{ objectFit: "cover", borderRadius: 4 }}
                preview={{
                  mask: <EyeOutlined />,
                }}
              />
            )}
            <Tag icon={<CarOutlined />} color="blue">
              License
            </Tag>
          </Space>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "National ID",
      key: "cccd",
      align: "center",
      render: (_, record) => {
        const hasCCCD = record.cccdFrontUrl || record.cccdBackUrl;
        return hasCCCD ? (
          <Space direction="vertical" size="small">
            {record.cccdFrontUrl && (
              <Image
                src={record.cccdFrontUrl}
                alt="National ID front"
                width={80}
                height={50}
                style={{ objectFit: "cover", borderRadius: 4 }}
                preview={{
                  mask: <EyeOutlined />,
                }}
              />
            )}
            <Tag icon={<IdcardOutlined />} color="green">
              National ID
            </Tag>
          </Space>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isVerified",
      key: "isVerified",
      align: "center",
      render: (isVerified, record) => {
        const hasDocuments = hasAllDocuments(record);
        
        if (isVerified) {
              return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Verified
            </Tag>
          );
        }
        
        if (!hasDocuments) {
            return (
          <Tag icon={<CloseCircleOutlined />} color="default">
              Not verified
            </Tag>
          );
        }
        
            return (
          <Tag icon={<CloseCircleOutlined />} color="warning">
            Pending verification
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const hasDocuments = hasAllDocuments(record);
        
        // If no documents, do not show actions
          if (!hasDocuments) {
          return (
            <span className="text-gray-400 text-sm">
              No documents
            </span>
          );
        }
        
        return (
          <Space>
              <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="small"
            >
              View details
            </Button>
            {!record.isVerified && (
              <>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedRenter(record);
                    setRejectModalVisible(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleVerifyClick(record.id)}
                  loading={loading}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                  size="small"
                >
                  Verify
                </Button>
              </>
            )}
          </Space>
        );
      },
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
            showTotal: (total) => `Total ${total} renters`,
          }}
          className="min-w-[1100px]"
        />
      </div>

      {/* Detail modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
              <span>Renter details</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={
          selectedRenter && !selectedRenter.isVerified ? (
            <Space>
              <Button onClick={() => setModalVisible(false)}>Close</Button>
                <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModalVisible(true)}
              >
                ❌ Reject
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleVerifyClick(selectedRenter.id)}
                loading={loading}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                ✅ Verify
              </Button>
            </Space>
          ) : (
                <Button type="primary" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          )
        }
      >
        {selectedRenter && (
          <div>
            {/* Personal information */}
            <Card title="📋 Personal information" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="ID">{selectedRenter.id}</Descriptions.Item>
                <Descriptions.Item label="Full name">{selectedRenter.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedRenter.email}</Descriptions.Item>
                <Descriptions.Item label="Phone number">
                  {selectedRenter.phone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={2}>
                  {selectedRenter.isVerified ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Verified
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="warning">
                      Pending verification
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Documents */}
            <Card title="📄 Documents">
              <Tabs defaultActiveKey="1">
                {/* Tab GPLX */}
                <TabPane
                  tab={
                      <span>
                      <CarOutlined />
                      Driver license
                    </span>
                  }
                  key="1"
                >
                  {selectedRenter.driverLicenseFrontUrl || selectedRenter.driverLicenseBackUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRenter.driverLicenseFrontUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Front</h4>
                          <Image
                            src={selectedRenter.driverLicenseFrontUrl}
                            alt="Driver license front"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                      {selectedRenter.driverLicenseBackUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Back</h4>
                          <Image
                            src={selectedRenter.driverLicenseBackUrl}
                            alt="Driver license back"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CarOutlined style={{ fontSize: 48 }} />
                      <p className="mt-2">No driver license available</p>
                    </div>
                  )}
                </TabPane>

                {/* Tab CCCD */}
                <TabPane
                  tab={
                      <span>
                      <IdcardOutlined />
                      National ID
                    </span>
                  }
                  key="2"
                >
                  {selectedRenter.cccdFrontUrl || selectedRenter.cccdBackUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRenter.cccdFrontUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Front</h4>
                          <Image
                            src={selectedRenter.cccdFrontUrl}
                            alt="National ID front"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                      {selectedRenter.cccdBackUrl && (
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-700">Back</h4>
                          <Image
                            src={selectedRenter.cccdBackUrl}
                            alt="National ID back"
                            style={{ borderRadius: 8 }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <IdcardOutlined style={{ fontSize: 48 }} />
                      <p className="mt-2">No national ID available</p>
                    </div>
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CloseCircleOutlined className="text-red-500" />
            <span>Reject verification</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason("");
        }}
        width={600}
        footer={
          <Space>
            <Button
              onClick={() => {
                setRejectModalVisible(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
              <Button
              danger
              onClick={handleRejectClick}
              loading={loading}
            >
              ❌ Confirm rejection
            </Button>
          </Space>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-800">
              ⚠️ You are about to reject verification for {selectedRenter?.fullName}
            </p>
            <p className="text-sm text-red-700 mt-2">
              Please enter a reason for rejection so we can notify the user.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rejection reason:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              rows={4}
              placeholder="Enter reason for rejection (e.g., unclear image, mismatched info, ...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RenterListTable;
