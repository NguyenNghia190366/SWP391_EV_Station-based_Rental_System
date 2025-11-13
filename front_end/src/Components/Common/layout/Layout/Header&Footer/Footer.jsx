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

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { Icon: FacebookOutlined, url: "https://facebook.com" },
    { Icon: TwitterOutlined, url: "https://twitter.com" },
    { Icon: InstagramOutlined, url: "https://instagram.com" },
    { Icon: YoutubeOutlined, url: "https://youtube.com" },
  ];

  const quickLinks = [
    { to: "/home", label: "Trang chủ" },
    { to: "/vehicles", label: "Xe điện" },
    { to: "/stations", label: "Trạm sạc" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/contact", label: "Liên hệ" },
  ];

  const services = [
    { to: "/rental", label: "Thuê xe theo giờ" },
    { to: "/rental/daily", label: "Thuê xe theo ngày" },
    { to: "/rental/monthly", label: "Thuê xe theo tháng" },
    { to: "/charging", label: "Dịch vụ sạc" },
    { to: "/maintenance", label: "Bảo dưỡng xe" },
  ];

  const supports = [
    { to: "/help", label: "Trung tâm trợ giúp" },
    { to: "/faq", label: "Câu hỏi thường gặp" },
    { to: "/terms", label: "Điều khoản sử dụng" },
    { to: "/privacy", label: "Chính sách bảo mật" },
    { to: "/refund", label: "Chính sách hoàn tiền" },
  ];

  const bottomLinks = [
    { to: "/sitemap", label: "Sơ đồ trang" },
    { to: "/accessibility", label: "Khả năng truy cập" },
    { to: "/cookies", label: "Cookie Policy" },
  ];

  return (
    <footer className="mt-auto bg-[#1e2a38] text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:pt-12 md:pb-6">
        {/* ---------- Top Section ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 text-2xl font-bold mb-4">
              <CarOutlined className="text-[28px] text-blue-300" />
              <span className="text-blue-100">EV Rental</span>
            </div>
            <p className="text-white/80 leading-relaxed mb-5">
              Hệ thống cho thuê xe điện hàng đầu Việt Nam. Mang đến trải nghiệm
              di chuyển xanh, sạch và thông minh cho mọi người.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white text-xl transition-all duration-300 hover:bg-blue-200 hover:text-[#1e2a38] hover:-translate-y-1"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title="Liên kết nhanh" delay="0.2s" items={quickLinks} />

          {/* Services */}
          <FooterColumn title="Dịch vụ" delay="0.3s" items={services} />

          {/* Support */}
          <FooterColumn title="Hỗ trợ" delay="0.4s" items={supports} />

          {/* Contact Info */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
            <FooterHeading title="Liên hệ" />
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/80 leading-relaxed">
                <EnvironmentOutlined className="text-lg text-blue-300 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Lô E2a-7, Đường D1, Long Thạnh Mỹ, TP Thủ Đức, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex gap-3 text-white/80">
                <PhoneOutlined className="text-lg text-blue-300 flex-shrink-0" />
                <a
                  href="tel:1900xxxx"
                  className="text-white/80 hover:text-blue-300 transition-colors duration-300"
                >
                  1900 xxxx
                </a>
              </li>
              <li className="flex gap-3 text-white/80">
                <MailOutlined className="text-lg text-blue-300 flex-shrink-0" />
                <a
                  href="mailto:support@evrental.vn"
                  className="text-white/80 hover:text-blue-300 transition-colors duration-300"
                >
                  support@evrental.vn
                </a>
              </li>
            </ul>

            <div className="mt-5 p-4 bg-white/10 rounded-lg border-l-[3px] border-blue-300">
              <strong className="block mb-2 text-blue-300">Giờ làm việc:</strong>
              <p className="my-1 text-white/80 text-sm">
                Thứ 2 - Thứ 6: 8:00 - 18:00
              </p>
              <p className="my-1 text-white/80 text-sm">
                Thứ 7 - CN: 9:00 - 17:00
              </p>
            </div>
          </div>
        </div>

        {/* ---------- Bottom Section ---------- */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/10 gap-4">
          <p className="text-white/60 m-0 text-center md:text-left">
            © {currentYear} EV Rental System. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            {bottomLinks.map(({ to, label }, i) => (
              <span key={to} className="flex items-center gap-4">
                <Link
                  to={to}
                  className="text-white/60 hover:text-blue-300 transition-colors duration-300"
                >
                  {label}
                </Link>
                {i < bottomLinks.length - 1 && (
                  <span className="text-white/30">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Helper Components ---------- */
function FooterHeading({ title }) {
  return (
    <h3 className="text-lg font-semibold mb-5 text-blue-300 relative pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-blue-300">
      {title}
    </h3>
  );
}

function FooterColumn({ title, delay, items }) {
  return (
    <div className="animate-fadeInUp" style={{ animationDelay: delay }}>
      <FooterHeading title={title} />
      <ul className="space-y-3">
        {items.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-white/80 no-underline transition-all duration-300 inline-block hover:text-blue-300 hover:translate-x-1"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
