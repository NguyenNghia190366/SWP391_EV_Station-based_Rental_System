import React, { useEffect, useState } from "react";
import { Card, Descriptions, Table, Spin, Tabs, Tag } from "antd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { UserOutlined, CarOutlined, WarningOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

export default function AdminCustomerProfilePage({ userId }) {
  const api = useAxiosInstance();
  const [user, setUser] = useState(null);
  const [renter, setRenter] = useState(null);
  const [history, setHistory] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch user info
        const userRes = await api.get(`/Users/${userId}`);
        setUser(userRes.data);
        // Fetch renter info
        const renterRes = await api.get(`/Renters/user/${userId}`);
        setRenter(renterRes.data);
        // Fetch rental history
        const historyRes = await api.get(`/RentalOrders/user/${userId}`);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        // Fetch complaints
        const complaintsRes = await api.get(`/Complaints/user/${userId}`);
        setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
      } catch (err) {
        console.error("Error loading customer profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchAll();
  }, [userId, api]);

  if (loading) return <Spin tip="Loading customer profile..." />;
  if (!user) return <Card>User not found.</Card>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card title={<span><UserOutlined /> Customer Profile</span>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Full Name">{user.full_name || user.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phone_number || user.phone}</Descriptions.Item>
          <Descriptions.Item label="Verified" span={2}>
            {renter?.is_verified ? <Tag color="green">Verified</Tag> : <Tag color="red">Not Verified</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
        <TabPane tab={<span><CarOutlined /> Rental History</span>} key="1">
          <Table
            dataSource={history}
            rowKey="id"
            columns={[
              { title: "Order ID", dataIndex: "id" },
              { title: "Vehicle", dataIndex: "vehicleId" },
              { title: "Start", dataIndex: "startTime" },
              { title: "End", dataIndex: "endTime" },
              { title: "Status", dataIndex: "status" },
            ]}
            pagination={false}
          />
        </TabPane>
        <TabPane tab={<span><WarningOutlined /> Complaints</span>} key="2">
          <Table
            dataSource={complaints}
            rowKey="id"
            columns={[
              { title: "Complaint ID", dataIndex: "id" },
              { title: "Content", dataIndex: "content" },
              { title: "Status", dataIndex: "status" },
              { title: "Created At", dataIndex: "createdAt" },
            ]}
            pagination={false}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}
