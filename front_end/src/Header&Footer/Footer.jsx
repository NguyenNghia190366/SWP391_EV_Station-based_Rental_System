import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
} from "@ant-design/icons";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Company Info */}
          <div className="footer-column">
            <div className="footer-logo">
              <CarOutlined className="footer-logo-icon" />
              <span className="footer-logo-text">EV Rental</span>
            </div>
            <p className="footer-description">
              Hệ thống cho thuê xe điện hàng đầu Việt Nam. Mang đến trải nghiệm
              di chuyển xanh, sạch và thông minh cho mọi người.
            </p>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FacebookOutlined />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <TwitterOutlined />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <InstagramOutlined />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <YoutubeOutlined />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li>
                <Link to="/home">Trang chủ</Link>
              </li>
              <li>
                <Link to="/vehicles">Xe điện</Link>
              </li>
              <li>
                <Link to="/stations">Trạm sạc</Link>
              </li>
              <li>
                <Link to="/about">Giới thiệu</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-title">Dịch vụ</h3>
            <ul className="footer-links">
              <li>
                <Link to="/rental">Thuê xe theo giờ</Link>
              </li>
              <li>
                <Link to="/rental/daily">Thuê xe theo ngày</Link>
              </li>
              <li>
                <Link to="/rental/monthly">Thuê xe theo tháng</Link>
              </li>
              <li>
                <Link to="/charging">Dịch vụ sạc</Link>
              </li>
              <li>
                <Link to="/maintenance">Bảo dưỡng xe</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h3 className="footer-title">Hỗ trợ</h3>
            <ul className="footer-links">
              <li>
                <Link to="/help">Trung tâm trợ giúp</Link>
              </li>
              <li>
                <Link to="/faq">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="/terms">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/refund">Chính sách hoàn tiền</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-contact">
              <li>
                <EnvironmentOutlined />
                <span>
                  Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức,
                  Thành phố Hồ Chí Minh
                </span>
              </li>
              <li>
                <PhoneOutlined />
                <a href="tel:1900xxxx">1900 xxxx</a>
              </li>
              <li>
                <MailOutlined />
                <a href="mailto:support@evrental.vn">support@evrental.vn</a>
              </li>
            </ul>
            <div className="footer-hours">
              <strong>Giờ làm việc:</strong>
              <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
              <p>Thứ 7 - CN: 9:00 - 17:00</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} EV Rental System. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/sitemap">Sơ đồ trang</Link>
            <span>•</span>
            <Link to="/accessibility">Khả năng truy cập</Link>
            <span>•</span>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
