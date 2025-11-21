// AdminDashboard: Main admin panel for managing users, vehicles, stations, and system overview
import React, { useEffect, useState } from "react";
import { Menu, Card, Statistic, Table, Button, Modal, Descriptions, Tag, Spin } from "antd";
import {
  EnvironmentOutlined,
  CarOutlined,
  UserOutlined,
  BarChartOutlined,
  DashboardOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import VerifyRenterPage from "./VerifyRenterPage";
import StationRegistrationPage from "./StationRegistrationPage";
import VehicleStatus from "../shared/VehicleStatus";
import AdminCustomerProfilePage from "./AdminCustomerProfilePage";
import { useUsers } from "@/hooks/useUsers";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import axios from "axios";

const AdminDashboard = () => {

  // Dashboard stats
  const [totalStations, setTotalStations] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  // User management states (for Manage Users tab)
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [selectedUserId, setSelectedUserId] = useState(null); // Which user is selected for profile view
  const [users, setUsers] = useState([]); // List of all users
  const [loadingUsers, setLoadingUsers] = useState(false); // Loading state for user list
  const [userError, setUserError] = useState(""); // Error message for users list
  const [profileModalVisible, setProfileModalVisible] = useState(false); // Modal visibility
  const [selectedUserDetail, setSelectedUserDetail] = useState(null); // Selected user detail
  // Per-user loading state for profile button
  const [loadingProfileUserId, setLoadingProfileUserId] = useState(null); // userId of loading profile
  const { getAllUsers } = useUsers();
  const api = useAxiosInstance();

  // Fetch users for Manage Users tab
  useEffect(() => {
    if (selectedMenu === "users") {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        setUserError("");
        try {
          const token = localStorage.getItem("token");
          console.log("🔍 Fetching users from /Users endpoint...");
          console.log("📌 Token in localStorage:", token ? "✅ Present" : "❌ Missing");
          const data = await getAllUsers();
          console.log("✅ Users data received:", data);
          // Log first user to see actual field names
          if (Array.isArray(data) && data.length > 0) {
            console.log("📋 Sample user object:", data[0]);
          }
          // Filter out users with role 'admin' or 'staff'
          const allUsers = Array.isArray(data) ? data : data.data || [];
          const filteredUsers = allUsers.filter(
            (u) => {
              const role = u.role || u.userRole || u.accountType || u.type;
              return role !== 'admin' && role !== 'staff';
            }
          );
          setUsers(filteredUsers);
        } catch (err) {
          console.error("❌ Error in fetchUsers:", err);
          console.error("Error status:", err?.response?.status);
          console.error("Error response:", err?.response?.data);
          setUsers([]);
          const errorMsg = err?.response?.status === 401 
            ? "Unauthorized - Please login again"
            : err?.message || "Failed to load users";
          setUserError(errorMsg);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [selectedMenu, getAllUsers]);

  // Fetch user detail and open modal
  const handleViewProfile = async (userId) => {
    setLoadingProfileUserId(userId);
    try {
      console.log("📥 Fetching profile for user:", userId);
      // Only fetch data for the specific user
      const userRes = await api.get(`/Users/${userId}`);
      const user = userRes.data;
      
      // Get this user's renter info (if exists)
      let renter = null;
      try {
        // Try to find renter by user_id
        const rentersRes = await api.get(`/Renters`);
        const renters = Array.isArray(rentersRes.data) ? rentersRes.data : [];
        renter = renters.find(r => (r.userId || r.user_id) === userId);
      } catch (err) {
        console.warn("Could not fetch renter info:", err.message);
      }
      
      // Get rental orders for this user (if renter exists)
      let userOrders = [];
      if (renter) {
        try {
          const ordersRes = await api.get(`/RentalOrders`);
          const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
          userOrders = orders.filter(o => (o.renterId || o.renter_id) === renter.id || renter.renterId || renter.renter_id);
        } catch (err) {
          console.warn("Could not fetch rental orders:", err.message);
        }
      }
      
      console.log("✅ User detail loaded:", { user, renter, ordersCount: userOrders.length });
      setSelectedUserDetail({
        user,
        renter,
        orders: userOrders
      });
      setProfileModalVisible(true);
    } catch (err) {
      console.error("❌ Error fetching user detail:", err);
    } finally {
      setLoadingProfileUserId(null);
    }
  };

  // Fetch dashboard stats for overview (stations, vehicles, users)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, stationsRes, usersRes] = await Promise.all([
          axios.get(
            "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Vehicles",
            {
              headers: { "ngrok-skip-browser-warning": "true" },
            }
          ),
          axios.get(
            "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Stations",
            {
              headers: { "ngrok-skip-browser-warning": "true" },
            }
          ),
          axios.get(
            "https://alani-uncorroboratory-sympetaly.ngrok-free.dev/api/Users",
            {
              headers: { "ngrok-skip-browser-warning": "true" },
            }
          ),
        ]);

        setTotalStations(stationsRes.data.length);
        setTotalVehicles(vehiclesRes.data.length);
        setTotalUsers(usersRes.data.length);
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch users for Manage Users tab
  useEffect(() => {
    if (selectedMenu === "users") {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const data = await getAllUsers();
          setUsers(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
          console.error("❌ Error fetching users:", err);
          setUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [selectedMenu, getAllUsers]);

  // Sidebar menu items for admin navigation
  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Overview",
    },
    {
      key: "verify-renter",
      icon: <UserAddOutlined />,
      label: "Verify Users",
    },
    {
      key: "register-station",
      icon: <EnvironmentOutlined />,
      label: "Register Station",
    },
    {
      key: "vehicle-status",
      icon: <CarOutlined />,
      label: "Vehicle Status",
    },
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: "Manage Vehicles",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Manage Users",
    },
    {
      key: "statistics",
      icon: <BarChartOutlined />,
      label: "Statistics",
    },
  ];

  // Render the main content area based on selected menu
  const renderContent = () => {
    switch (selectedMenu) {
      // System overview: stats and welcome
      case "overview":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              📊 System Overview
            </h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Stations"
                  value={totalStations}
                  prefix={<EnvironmentOutlined className="text-blue-500" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Vehicles"
                  value={totalVehicles}
                  prefix={<CarOutlined className="text-green-500" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Total Users"
                  value={totalUsers}
                  prefix={<UserOutlined className="text-purple-500" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                🎯 Welcome to Admin Dashboard
              </h3>
              <p className="text-gray-700 mb-4">
                Manage the EV Rental Station-based system. Use the left menu to
                access functions and admin tools.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    👤 Verify Users
                  </h4>
                  <p className="text-sm text-gray-600">
                    Manage and verify renters
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    🏢 Register Station
                  </h4>
                  <p className="text-sm text-gray-600">
                    Add a new charging station to the system
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    🚗 Manage Vehicles
                  </h4>
                  <p className="text-sm text-gray-600">
                    View and manage the vehicle inventory
                  </p>
                </div>
              </div>
            </Card>
          </Card>
        );

      // Renter verification management
      case "verify-renter":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <UserAddOutlined className="text-blue-500" />
                Verify Users
              </h2>
              <p className="text-gray-600 mt-2">
                Manage and verify renter information
              </p>
            </div>
            <VerifyRenterPage />
          </Card>
        );

      // Register new station
      case "register-station":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <EnvironmentOutlined className="text-purple-500" />
                Register station
              </h2>
              <p className="text-gray-600 mt-2">
                Add a new charging station to the system
              </p>
            </div>
            <StationRegistrationPage />
          </Card>
        );

      // Vehicle status monitoring
      case "vehicle-status":
        return (
          <div>
            <VehicleStatus />
          </div>
        );

      // Manage vehicle inventory (placeholder)
      case "vehicles":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <CarOutlined className="text-green-500" />
                Manage Vehicles
              </h2>
              <p className="text-gray-600 mt-2">
                View and manage the vehicle list in the system
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <CarOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Feature under development...
              </p>
            </div>
          </Card>
        );

      // Manage Users: list users and show profile/rental/complaints
      case "users":
        return (
          <>
            <Card className="shadow-lg" style={{ minHeight: "500px" }}>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <UserOutlined className="text-orange-500" />
                  Manage Users
                </h2>
                <p className="text-gray-600 mt-2">
                  Manage accounts and user roles. Click View Profile to see details, rental history, and payment info.
                </p>
              </div>
              {userError && (
                <div style={{ 
                  backgroundColor: '#ffebee', 
                  color: '#c62828', 
                  padding: '12px', 
                  borderRadius: '4px', 
                  marginBottom: '16px',
                  border: '1px solid #ef5350'
                }}>
                  <strong>❌ Error loading users:</strong> {userError}
                </div>
              )}
                <Table
                dataSource={users}
                rowKey={(record) => record.id || record.userId || record.user_id}
                loading={loadingUsers}
                columns={[
                  { 
                    title: "ID", 
                    dataIndex: "id",
                    render: (text, record) => record.id || record.userId || record.user_id
                  },
                  { 
                    title: "Full Name", 
                    dataIndex: "fullName",
                    render: (text, record) => record.fullName || record.full_name || "-"
                  },
                  { title: "Email", dataIndex: "email" },
                  { 
                    title: "Phone", 
                    dataIndex: "phoneNumber",
                    render: (text, record) => record.phoneNumber || record.phone_number || record.phone || "-"
                  },
                  {
                    title: "Actions",
                    render: (_, record) => {
                      const userId = record.id || record.userId || record.user_id;
                      return (
                        <Button
                          type="link"
                          onClick={() => {
                            console.log("🔍 Clicked View Profile for user:", userId);
                            handleViewProfile(userId);
                          }}
                          loading={loadingProfileUserId === userId}
                        >
                          View Profile
                        </Button>
                      );
                    },
                  },
                ]}
                pagination={{ pageSize: 10 }}
              />
            </Card>

            {/* Customer Detail Modal */}
            <Modal
              title={<span><UserOutlined /> Customer Profile</span>}
              open={profileModalVisible}
              onCancel={() => setProfileModalVisible(false)}
              width={900}
              footer={<Button onClick={() => setProfileModalVisible(false)}>Close</Button>}
            >
              <Spin spinning={!!loadingProfileUserId}>
                {selectedUserDetail && (
                  <>
                    {/* Personal Information */}
                    <Card title="👤 Personal Information" style={{ marginBottom: 16 }}>
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID">{selectedUserDetail.user?.id}</Descriptions.Item>
                        <Descriptions.Item label="Full Name">
                          {selectedUserDetail.user?.fullName || selectedUserDetail.user?.full_name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedUserDetail.user?.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">
                          {selectedUserDetail.user?.phoneNumber || selectedUserDetail.user?.phone_number || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Verification Status" span={2}>
                          {selectedUserDetail.renter?.isVerified ? (
                            <Tag color="green">✅ Verified</Tag>
                          ) : (
                            <Tag color="red">❌ Not Verified</Tag>
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    {/* Rental History */}
                    <Card title="🚗 Rental History" style={{ marginBottom: 16 }}>
                      {selectedUserDetail.orders && selectedUserDetail.orders.length > 0 ? (
                        <Table
                          dataSource={selectedUserDetail.orders}
                          rowKey="id"
                          columns={[
                            { 
                              title: "Order ID", 
                              dataIndex: "orderId",
                              render: (id) => <b>#{id}</b>
                            },
                            { 
                              title: "Status", 
                              dataIndex: "status",
                              render: (status) => {
                                const colorMap = {
                                  APPROVED: "green",
                                  IN_USE: "blue",
                                  COMPLETED: "cyan",
                                  CANCELLED: "red"
                                };
                                return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
                              }
                            },
                            { 
                              title: "Start Time", 
                              dataIndex: "startTime",
                              render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-"
                            },
                            { 
                              title: "End Time", 
                              dataIndex: "endTime",
                              render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-"
                            },
                          ]}
                          pagination={false}
                        />
                      ) : (
                        <p style={{ textAlign: "center", color: "#999" }}>No rental history</p>
                      )}
                    </Card>

                    {/* Payment History */}
                    <Card title="💰 Payment History">
                      <p style={{ textAlign: "center", color: "#999" }}>Coming soon...</p>
                    </Card>
                  </>
                )}
              </Spin>
            </Modal>
          </>
        );

      // System statistics (placeholder)
      case "statistics":
        return (
          <Card className="shadow-lg" style={{ minHeight: "500px" }}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <BarChartOutlined className="text-pink-500" />
                Statistics
              </h2>
              <p className="text-gray-600 mt-2">
                View system reports and statistics
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChartOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Feature under development...
              </p>
            </div>
          </Card>
        );

      // Fallback for unknown menu
      default:
        return null;
    }
  };

  // Main layout: sidebar and main content
  return (
    <div className="flex min-h-screen w-full bg-gray-50 overflow-x-hidden">
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
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
          <h3 className="text-xl font-bold text-white mb-1">Admin Dashboard</h3>
          <p className="text-indigo-100 text-sm">System management</p>
        </div>

        {/* Menu */}
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

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 bg-gray-50 w-full">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;