import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Dropdown, Badge, Button } from "antd";
import NotificationBell from "../Components/Common/Notifications/NotificationBell";
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CarOutlined,
  MenuOutlined,
  CloseOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user từ localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        const loggedIn = localStorage.getItem("isLoggedIn");

        if (loggedIn === "true" && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    loadUser();

    // Listen for storage changes (đăng xuất ở tab khác)
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Menu cho user dropdown
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Trang cá nhân",
      onClick: () => navigate("/profile"),
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            key: "admin-dashboard",
            icon: <DashboardOutlined />,
            label: "Admin Dashboard",
            onClick: () => navigate("/admin/dashboard"),
          },
        ]
      : []),
    ...(user?.role === "STAFF"
      ? [
          {
            key: "staff-dashboard",
            icon: <DashboardOutlined />,
            label: "Staff Dashboard",
            onClick: () => navigate("/staff/dashboard"),
          },
        ]
      : []),
    // Only show "Lịch sử thuê xe" for RENTER role
    ...(user?.role === "RENTER"
      ? [
          {
            key: "my-bookings",
            icon: <CarOutlined />,
            label: "Lịch sử thuê xe",
            onClick: () => navigate("/my-bookings"),
          },
        ]
      : []),
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Navigation items
  const navItems = [
    { path: "/home", label: "Trang chủ" },
    { path: "/vehicles", label: "Xe điện" },
    { path: "/about", label: "Giới thiệu" },
    { path: "/contact", label: "Liên hệ" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-[1000] bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link 
          to="/home" 
          className="flex items-center gap-3 text-2xl font-bold text-white no-underline transition-all duration-300 hover:scale-105 hover:text-yellow-300"
        >
          <CarOutlined className="text-[28px] animate-bounce" style={{ animationDuration: '3s' }} />
          <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent hidden sm:inline">
            EV Rental
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300
                relative
                ${isActive(item.path) 
                  ? 'text-white bg-white/20 font-semibold' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {item.label}
              <span className={`
                absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-yellow-300 transition-all duration-300
                ${isActive(item.path) ? 'w-4/5' : 'w-0 group-hover:w-4/5'}
              `} />
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <div>
                <NotificationBell />
              </div>

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
                trigger={["click"]}
              >
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/10 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5">
                  <Avatar
                    src={user?.avatar}
                    icon={!user?.avatar && <UserOutlined />}
                    className="border-2 border-white shadow-md"
                  />
                  <span className="hidden md:inline text-white font-semibold max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.fullName || user?.name || "User"}
                  </span>
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="hidden md:flex gap-3">
              <Button 
                type="default" 
                onClick={() => navigate("/login")}
                className="rounded-lg font-medium h-9 px-5 border-white text-white bg-transparent hover:border-yellow-300 hover:text-yellow-300 hover:bg-white/10"
              >
                Đăng nhập
              </Button>
              <Button 
                type="primary" 
                onClick={() => navigate("/register")}
                className="rounded-lg font-medium h-9 px-5 bg-white border-white text-indigo-500 hover:bg-yellow-300 hover:border-yellow-300 hover:text-gray-800"
              >
                Đăng ký
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            type="text"
            icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            className="md:hidden text-white text-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden flex flex-col p-4 bg-indigo-500/95 border-t border-white/10 animate-slideDown">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${isActive(item.path) 
                  ? 'text-white bg-white/20 font-semibold' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                }
              `}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20">
              <Button
                type="default"
                block
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg font-medium border-white text-white bg-transparent hover:border-yellow-300 hover:text-yellow-300"
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                block
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg font-medium bg-white text-indigo-500 hover:bg-yellow-300 hover:text-gray-800"
              >
                Đăng ký
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
