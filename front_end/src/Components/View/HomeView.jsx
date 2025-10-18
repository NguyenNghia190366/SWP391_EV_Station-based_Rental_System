import React, { useEffect, useState } from "react";
import "./HomeView.css";

const SDZHomepage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    setUser(null);
    alert("You have been logged out.");
    window.location.href = "/home";
  };

  return (
    <div className="sdz-container">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="nav-left">
            <a href="/home" className="logo-link">
              <h1 className="logo">
                <span>SDZ</span>
              </h1>
            </a>
            <div className="nav-links">
              <a href="/home" className="home-btn">Trang Chủ</a>
              <a href="#">Đi xe</a>
              <a href="#">Lái xe</a>
              <a href="#">Doanh nghiệp</a>
            </div>
          </div>

          <div className="nav-buttons">
            {user ? (
              <div className="profile-wrapper">
                <img
                  src={
                    user.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={user.fullName}
                  className="profile-avatar"
                  onClick={() => setMenuOpen(!menuOpen)}
                />

                <div className={`profile-menu ${menuOpen ? "active" : ""}`}>
                  <div className="profile-info">
                    <img
                      src={
                        user.avatar ||
                        user.avatarUrl ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={user.fullName || "user avatar"}
                      className="profile-avatar-lg"
                    />
                    <div className="profile-text">
                      <p className="profile-name">{user.fullName}</p>
                      {user.email && (
                        <p className="profile-email">{user.email}</p>
                      )}
                    </div>
                  </div>

                  <hr className="profile-divider" />

                  <a href="/profile" className="menu-link">
                    Hồ sơ cá nhân
                  </a>
                  <a href="/settings" className="menu-link">
                    Cài đặt
                  </a>

                  <button onClick={handleLogout} className="menu-logout">
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a href="/login" className="btn btn-outline-primary">
                  Đăng nhập
                </a>
                <a href="/register" className="btn btn-primary">
                  Đăng ký
                </a>
              </>
            )}
          </div>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h2 className="hero-title">Đi đến bất cứ đâu với SDZ</h2>
              <p className="hero-subtitle">
                Đặt chuyến đi, di chuyển nhanh chóng và an toàn với SDZ
              </p>

              <div className="booking-form">
                <div className="booking-tabs">
                  <button className="tab-btn active">Đi xe</button>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <div className="location-dot"></div>
                    <input type="text" placeholder="Nhập địa điểm đón" />
                  </div>

                  <div className="input-wrapper">
                    <div className="location-dot outline"></div>
                    <input type="text" placeholder="Nhập địa điểm đến" />
                  </div>
                </div>

                <button className="btn btn-submit">Xem giá cước</button>
              </div>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80"
                alt="SDZ car"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <h3 className="section-title">Dịch vụ của chúng tôi</h3>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h4 className="service-title">Đi xe</h4>
              <p className="service-description">
                Đặt chuyến đi trong vài giây với ứng dụng dễ sử dụng
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h4 className="service-title">Lái xe kiếm tiền</h4>
              <p className="service-description">
                Trở thành đối tác tài xế và kiếm tiền theo lịch trình linh hoạt
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h4 className="service-title">SDZ Eats</h4>
              <p className="service-description">
                Đặt món ăn yêu thích và giao tận nơi nhanh chóng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h3 className="cta-title">Sẵn sàng bắt đầu?</h3>
          <p className="cta-subtitle">
            Tải ứng dụng SDZ ngay hôm nay và trải nghiệm dịch vụ tốt nhất
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary btn-large">Đăng ký ngay</button>
            <button className="btn btn-outline btn-large">Tìm hiểu thêm</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h5>Công ty</h5>
              <ul>
                <li>
                  <a href="#">Giới thiệu</a>
                </li>
                <li>
                  <a href="#">Tin tức</a>
                </li>
                <li>
                  <a href="#">Tuyển dụng</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h5>Sản phẩm</h5>
              <ul>
                <li>
                  <a href="#">Đi xe</a>
                </li>
                <li>
                  <a href="#">Lái xe</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h5>Hỗ trợ</h5>
              <ul>
                <li>
                  <a href="#">Trợ giúp</a>
                </li>
                <li>
                  <a href="#">Liên hệ</a>
                </li>
                <li>
                  <a href="#">An toàn</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h5>Kết nối</h5>
              <div className="social-links">
                <a href="#" className="social-link">
                  f
                </a>
                <a href="#" className="social-link">
                  t
                </a>
                <a href="#" className="social-link">
                  in
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SDZ Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SDZHomepage;
