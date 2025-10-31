import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "antd";
import { 
  EnvironmentOutlined, 
  CarOutlined, 
  UserOutlined, 
  BarChartOutlined 
} from "@ant-design/icons";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: "🏢 Đăng Ký Trạm Sạc",
      description: "Thêm trạm sạc mới vào hệ thống",
      icon: <EnvironmentOutlined style={{ fontSize: 40, color: "#6366f1" }} />,
      path: "/admin/register-station",
      color: "from-purple-500 to-blue-500"
    },
    {
      title: "🚗 Quản Lý Xe",
      description: "Xem và quản lý danh sách xe",
      icon: <CarOutlined style={{ fontSize: 40, color: "#10b981" }} />,
      path: "/vehicles",
      color: "from-green-500 to-teal-500"
    },
    {
      title: "👥 Quản Lý User",
      description: "Xem và quản lý người dùng",
      icon: <UserOutlined style={{ fontSize: 40, color: "#f59e0b" }} />,
      path: "/admin/users",
      color: "from-orange-500 to-yellow-500"
    },
    {
      title: "📊 Thống Kê",
      description: "Xem báo cáo và thống kê",
      icon: <BarChartOutlined style={{ fontSize: 40, color: "#ec4899" }} />,
      path: "/admin/statistics",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎛️ Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý hệ thống EV Rental - Station Based
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminActions.map((action, index) => (
            <Card
              key={index}
              hoverable
              className="rounded-2xl shadow-lg border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
              onClick={() => navigate(action.path)}
              style={{ 
                background: 'white',
                cursor: 'pointer' 
              }}
            >
              <div className="text-center p-4">
                {/* Icon with gradient background */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${action.color} mb-4`}>
                  <div className="bg-white bg-opacity-30 rounded-full p-2">
                    {action.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {action.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {action.description}
                </p>

                {/* Button */}
                <Button 
                  type="primary"
                  className={`bg-gradient-to-r ${action.color} border-0 hover:opacity-90 transition-opacity`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(action.path);
                  }}
                >
                  Truy cập →
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng Trạm Sạc</p>
                <p className="text-3xl font-bold text-gray-800">12</p>
              </div>
              <EnvironmentOutlined className="text-5xl text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng Xe</p>
                <p className="text-3xl font-bold text-gray-800">48</p>
              </div>
              <CarOutlined className="text-5xl text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Người Dùng</p>
                <p className="text-3xl font-bold text-gray-800">234</p>
              </div>
              <UserOutlined className="text-5xl text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;