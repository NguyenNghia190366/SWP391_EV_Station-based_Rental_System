import emailjs from "emailjs-com";
import { message } from "antd";

export const useEmail = () => {
  const sendEmail = async (renter, order, status) => {
    try {
      // ✅ Tùy nội dung theo trạng thái
      let statusText = "";
      let color = "";

      if (status === "Approved") {
        statusText = "Đơn thuê xe của bạn đã được duyệt thành công ✅.";
        color = "#16a34a";
      } else if (status === "Rejected") {
        statusText = "Đơn thuê xe của bạn đã bị từ chối ❌.";
        color = "#dc2626";
      }

      const res = await emailjs.send(
        "service_cuzmirb",      // service ID của bạn
        "template_xxx",         // template ID EmailJS
        {
          to_name: renter.fullName,
          to_email: renter.email,
          order_id: order.id,
          statusText: `<span style="color:${color};">${statusText}</span>`,
        },
        "YOUR_PUBLIC_KEY"       // public key
      );

      message.success("✅ Đã gửi email thông báo!");
      console.log("EmailJS response:", res);
    } catch (err) {
      console.error("❌ Lỗi gửi email:", err);
      message.error("Không thể gửi email thông báo!");
    }
  };

  return { sendEmail };
};
