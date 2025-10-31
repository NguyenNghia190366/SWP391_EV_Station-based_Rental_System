import { useState } from 'react';
import { Tabs, Button, Card } from 'antd';
import { BookOutlined, IdcardOutlined, CarOutlined, EnvironmentOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StaffVerificationDashboard from "./StaffVerificationDashboard";
import BookingRequestsManagement from "../../Components/StationStaff/BookingRequestsManagement";

const { TabPane } = Tabs;

const StaffDashboard = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header with Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                👨‍💼 Staff Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý booking, xác thực giấy tờ và hỗ trợ khách hàng
                            </p>
                        </div>
                        
                        {/* Quick Action Button */}
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusCircleOutlined />}
                            onClick={() => navigate('/staff/register-station')}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <span className="font-semibold">Đăng Ký Trạm Sạc</span>
                        </Button>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab}
                        size="large"
                        className="staff-tabs"
                    >
                        <TabPane 
                            tab={
                                <span className="flex items-center gap-2">
                                    <BookOutlined />
                                    <span className="font-semibold">Booking Requests</span>
                                </span>
                            } 
                            key="bookings"
                        >
                            <BookingRequestsManagement />
                        </TabPane>

                        <TabPane 
                            tab={
                                <span className="flex items-center gap-2">
                                    <CarOutlined />
                                    <span className="font-semibold">Verify License</span>
                                </span>
                            } 
                            key="license"
                        >
                            <StaffVerificationDashboard defaultTab="licenses" />
                        </TabPane>

                        <TabPane 
                            tab={
                                <span className="flex items-center gap-2">
                                    <IdcardOutlined />
                                    <span className="font-semibold">Verify CCCD</span>
                                </span>
                            } 
                            key="cccd"
                        >
                            <StaffVerificationDashboard defaultTab="idcards" />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default StaffDashboard;