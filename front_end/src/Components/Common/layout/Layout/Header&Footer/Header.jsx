import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Dropdown, Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CarOutlined,
  MenuOutlined,
  CloseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { clearUserData } from "../../../../../utils/auth";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ------------------ Load user ------------------
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
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // ------------------ Logout ------------------
  const handleLogout = () => {
    clearUserData();
    setUser(null);
    setIsLoggedIn(false);
    navigate("/login");
  };

  // ------------------ User Menu ------------------
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
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // ------------------ Navigation ------------------
  const navItems = [
    { path: "/home", label: "Trang chủ" },
    { path: "/vehicles", label: "Xe điện" },
    { path: "/about", label: "Giới thiệu" },
    { path: "/contact", label: "Liên hệ" },
  ];

  const isActive = (path) => location.pathname === path;

  // ------------------ Render ------------------
  return (
    <header className="sticky top-0 z-[1000] bg-[#1e2a38] shadow-md">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
        {/* ---------- Logo ---------- */}
        <Link
          to="/home"
          className="flex items-center gap-3 text-2xl font-bold text-white no-underline"
        >
          <CarOutlined className="text-[28px] text-blue-300" />
          <span className="text-blue-100 hidden sm:inline">EV Rental</span>
        </Link>

        {/* ---------- Desktop Nav ---------- */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-white bg-blue-800/40"
                  : "text-white/80 hover:text-white hover:bg-blue-800/20"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ---------- Right Section ---------- */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-blue-800/30 cursor-pointer hover:bg-blue-700/40 transition-colors duration-200">
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  className="border border-blue-300"
                />
                <span className="hidden md:inline text-white font-medium max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {user?.fullName || user?.name || "User"}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div className="hidden md:flex gap-3">
              <Button
                type="default"
                onClick={() => navigate("/login")}
                className="rounded-lg font-medium h-9 px-5 border-blue-300 text-white bg-transparent hover:border-blue-400 hover:text-blue-300"
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/register")}
                className="rounded-lg font-medium h-9 px-5 bg-blue-300 border-none text-[#1e2a38] hover:bg-blue-200"
              >
                Đăng ký
              </Button>
            </div>
          )}

          {/* ---------- Mobile Toggle ---------- */}
          <Button
            type="text"
            icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            className="md:hidden text-white text-xl"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* ---------- Mobile Nav ---------- */}
      {mobileMenuOpen && (
        <nav className="md:hidden flex flex-col p-4 bg-[#253446] border-t border-blue-800/30">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg font-medium ${
                isActive(item.path)
                  ? "text-white bg-blue-800/30"
                  : "text-white/80 hover:text-white hover:bg-blue-800/20"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-blue-800/40">
              <Button
                type="default"
                block
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg font-medium border-blue-300 text-white bg-transparent hover:text-blue-300 hover:border-blue-400"
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
                className="rounded-lg font-medium bg-blue-300 text-[#1e2a38] hover:bg-blue-200"
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
