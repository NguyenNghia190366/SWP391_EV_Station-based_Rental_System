import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Dropdown, Badge, Button } from "antd";
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
import "./Header.css";

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
    ...(user?.role === "admin"
      ? [
          {
            key: "admin-dashboard",
            icon: <DashboardOutlined />,
            label: "Admin Dashboard",
            onClick: () => navigate("/admin/dashboard"),
          },
        ]
      : []),
    ...(user?.role === "staff"
      ? [
          {
            key: "staff-dashboard",
            icon: <DashboardOutlined />,
            label: "Staff Dashboard",
            onClick: () => navigate("/staff/dashboard"),
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
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/home" className="header-logo">
          <CarOutlined className="logo-icon" />
          <span className="logo-text">EV Rental</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="header-right">
          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <Badge count={5} offset={[-5, 5]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="notification-btn"
                  onClick={() => navigate("/notifications")}
                />
              </Badge>

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
                trigger={["click"]}
              >
                <div className="user-profile">
                  <Avatar
                    src={user?.avatar}
                    icon={!user?.avatar && <UserOutlined />}
                    className="user-avatar"
                  />
                  <span className="user-name">{user?.fullName || user?.name || "User"}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="auth-buttons">
              <Button type="default" onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            type="text"
            icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="header-nav mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="mobile-auth-buttons">
              <Button
                type="default"
                block
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
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
