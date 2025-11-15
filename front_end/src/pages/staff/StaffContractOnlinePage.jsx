import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Space, message, Spin, Modal, Input, Tag, Divider, Form } from "antd";
import { EditOutlined, CheckOutlined, DollarOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { usePayment } from "@/hooks/usePayment";
import FormItem from "antd/es/form/FormItem";

export default function StaffContractOnlinePage() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureModal, setSignatureModal] = useState(false);
  const [signature, setSignature] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isContractSent, setIsContractSent] = useState(false);
  const contractRef = useRef();
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ fullName: "", description: "" });
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        // Step 1: Get order first to know what IDs we need
        const orderRes = await axiosInstance.get(`/RentalOrders/${orderId}`);
        const orderData = orderRes.data;
        console.log("Order:", orderData);

        // Step 2: Fetch only necessary data in parallel
        const apiCalls = [
          axiosInstance.get(`/Vehicles/${orderData.vehicleId}`).catch(() => null),
          axiosInstance.get(`/Renters`).then(res => res.data).catch(() => []),
        ];

        // Add station calls if IDs exist
        if (orderData.pickupStationId) {
          apiCalls.push(
            axiosInstance.get(`/Stations/${orderData.pickupStationId}`).catch(() => null)
          );
        }
        if (orderData.returnStationId) {
          apiCalls.push(
            axiosInstance.get(`/Stations/${orderData.returnStationId}`).catch(() => null)
          );
        }

        const [vehicleRes, rentersData, pickupStationRes, returnStationRes] = await Promise.all(apiCalls);
        
        const vehicle = vehicleRes?.data;
        console.log("Vehicle:", vehicle);

        // Step 3: Get vehicle model and renter details
        const additionalCalls = [];
        
        if (vehicle?.vehicleModelId) {
          additionalCalls.push(
            axiosInstance.get(`/VehicleModels/${vehicle.vehicleModelId}`).catch(() => null)
          );
        } else {
          additionalCalls.push(Promise.resolve(null));
        }

        // Find renter
        const renter = Array.isArray(rentersData) 
          ? rentersData.find(r => r.renterId === orderData.renterId)
          : null;
        console.log("Matched Renter:", renter);

        if (renter?.userId) {
          additionalCalls.push(
            axiosInstance.get(`/Users/${renter.userId}`).catch(() => null)
          );
        } else {
          additionalCalls.push(Promise.resolve(null));
        }

        // Get CCCD
        additionalCalls.push(
          axiosInstance.get(`/Cccds`)
            .then(res => {
              const cccdsData = Array.isArray(res.data) ? res.data : [];
              return cccdsData.find(c => c.renter_Id === orderData.renterId) || null;
            })
            .catch(() => null)
        );

        const [vehicleModelRes, userRes, cccdInfo] = await Promise.all(additionalCalls);
        
        const vehicleModel = vehicleModelRes?.data;
        const userInfo = userRes?.data || {};
        
        console.log("VehicleModel:", vehicleModel);
        console.log("User Info:", userInfo);
        console.log("CCCD Info:", cccdInfo);

        // Step 4: Compose vehicle name
        const vehicleName = vehicleModel?.brandName && vehicle?.model
          ? `${vehicleModel.brandName} ${vehicle.model}`.trim()
          : vehicle?.vehicleName || "(Không có)";

        // Step 5: Merge all data
        const mergedOrder = {
          ...orderData,
          // Renter info
          renterName: userInfo?.fullName || renter?.fullName || "(Không có)",
          renterPhone: userInfo?.phoneNumber || renter?.phoneNumber || "(Không có)",
          renterEmail: userInfo?.email || renter?.email || "(Không có)",
          renterIdNumber: cccdInfo?.id_Card_Number || renter?.cccd || "(Không có)",
          // Vehicle info
          vehicleName,
          vehicleLicensePlate: vehicle?.licensePlate || "(Không có)",
          vehicleColor: vehicleModel?.vehicleColor || vehicle?.vehicleColor || "(Không có)",
          pricePerHour: vehicleModel?.price_per_hour || 0,
          // Station info
          pickupStationName: pickupStationRes?.data?.stationName || "(Không có)",
          returnStationName: returnStationRes?.data?.stationName || "(Không có)",
        };

        console.log("Merged Order:", mergedOrder);
        setOrder(mergedOrder);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải thông tin đơn. Vui lòng thử lại.");
        message.error("Không thể tải thông tin đơn.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, axiosInstance]);

  const handleSignContract = () => {
    setSignatureModal(true);
  };

  const handleConfirmSignature = () => {
    if (!signature.trim()) {
      message.error("Vui lòng nhập chữ ký!");
      return;
    }
    setIsSigning(true);
    
    // Simulate API call to save signature
    setTimeout(() => {
      setIsSigned(true);
      setIsSigning(false);
      setSignatureModal(false);
      message.success("Đã ký hợp đồng thành công!");
    }, 1000);
  };

  const handleSendToRenter = async () => {
    setIsSending(true);
    try {
      // Update order status to notify renter
      const updatePayload = {
        status: "CONTRACT_SENT"
      };
      console.log("📤 Sending contract with payload:", updatePayload);
      const response = await axiosInstance.put(`/RentalOrders/${orderId}`, updatePayload);
      console.log("✅ Contract sent successfully:", response.data);
      setIsContractSent(true);
      message.success("Hợp đồng đã được gửi cho khách hàng!");
    } catch (err) {
      console.error("❌ Error sending contract:", err);
      console.error("Response status:", err?.response?.status);
      console.error("Response data:", err?.response?.data);
      message.error(`Không thể gửi hợp đồng: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;
    
    // Open payment modal instead of processing directly
    setPaymentModal(true);
  };

  const { createPayment } = usePayment();

  const handlePaymentWithDetails = async () => {
    if (!paymentForm.fullName.trim()) {
      message.error("Vui lòng nhập tên khách hàng!");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      // Calculate total amount
      const startTime = order.startTime ? dayjs(order.startTime) : null;
      const endTime = order.endTime ? dayjs(order.endTime) : null;
      const rentalHours = startTime && endTime ? endTime.diff(startTime, 'hour', true) : 0;
      const pricePerHour = order.pricePerHour || 0;
      const rentalPrice = rentalHours * pricePerHour;
      const depositPrice = rentalPrice * 0.3;
      const totalPrice = rentalPrice + depositPrice;

      // Call createPayment with fullName and description
      const paymentResponse = await createPayment(
        orderId,
        totalPrice,
        "rental",
        paymentForm.fullName,
        paymentForm.description
      );

      if (paymentResponse?.paymentUrl) {
        // Redirect to VNPay
        window.location.href = paymentResponse.paymentUrl;
      } else {
        message.error("Không thể khởi tạo thanh toán VNPay");
      }

      setPaymentModal(false);
      setPaymentForm({ fullName: "", description: "" });
    } catch (err) {
      console.error("Payment error:", err);
      message.error("Lỗi khi xử lý thanh toán");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const renderContract = () => {
    if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;
    if (!order) return <div style={{ padding: 20 }}>Không có dữ liệu hợp đồng.</div>;

    const o = order;

    return (
      <div ref={contractRef} style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2>HỢP ĐỒNG THUÊ XE TRỰC TUYẾN</h2>
          <p>Mã đơn: #{orderId}</p>
          {isSigned && (
            <Tag color="green" style={{ marginTop: 10 }}>
              ✓ Đã ký điện tử
            </Tag>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Khách hàng:</b> {o.renterName}</p>
          <p><b>Số điện thoại:</b> {o.renterPhone}</p>
          <p><b>Email:</b> {o.renterEmail}</p>
          <p><b>CMND/CCCD:</b> {o.renterIdNumber}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Tên Xe:</b> {o.vehicleName}</p>
          <p><b>Biển số xe:</b> {o.vehicleLicensePlate}</p>
          <p><b>Màu xe:</b> {o.vehicleColor}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Thời gian thuê:</b></p>
          <p style={{ marginLeft: 20 }}>
            Từ: {o.startTime ? dayjs(o.startTime).format("DD/MM/YYYY HH:mm") : "(Không có)"}
          </p>
          <p style={{ marginLeft: 20 }}>
            Đến: {o.endTime ? dayjs(o.endTime).format("DD/MM/YYYY HH:mm") : "(Không có)"}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Trạm nhận:</b> {o.pickupStationName}</p>
          <p><b>Trạm trả:</b> {o.returnStationName}</p>
          <p><b>Ngày tạo đơn:</b> {o.createdAt ? dayjs(o.createdAt).format("DD/MM/YYYY HH:mm") : "(Không có)"}</p>
          <p><b>Trạng thái:</b> {o.status === "APPROVED" ? "Đã duyệt" : o.status || "(Không có)"}</p>
        </div>

        <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <p><b>Điều khoản cơ bản:</b></p>
          <ol style={{ marginLeft: 20 }}>
            <li>Bên thuê cam kết nhận xe đúng thời gian và địa điểm quy định.</li>
            <li>Phí thuê và các điều khoản thanh toán theo hợp đồng riêng.</li>
            <li>Bên thuê chịu trách nhiệm về mọi hư hỏng và tai nạn trong thời gian sử dụng.</li>
            <li>Mọi sửa đổi phải được hai bên xác nhận bằng văn bản.</li>
            <li>Phải trả xe đúng thời gian, nếu trễ sẽ chịu phí phạt.</li>
          </ol>
        </div>

        <div style={{ marginTop: 30, backgroundColor: "#f5f5f5", padding: 20, borderRadius: 8 }}>
          <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>BẢNG TÍNH CHI PHÍ</p>
          {(() => {
            const startTime = o.startTime ? dayjs(o.startTime) : null;
            const endTime = o.endTime ? dayjs(o.endTime) : null;
            const rentalHours = startTime && endTime ? endTime.diff(startTime, 'hour', true) : 0;
            const pricePerHour = o.pricePerHour || 0;
            const rentalPrice = rentalHours * pricePerHour;
            const depositPrice = rentalPrice * 0.3;
            const totalPrice = rentalPrice + depositPrice;

            return (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Giá thuê / giờ:</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(pricePerHour)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Số giờ thuê:</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                      {rentalHours.toFixed(2)} giờ
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Tiền thuê xe:</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(rentalPrice)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Tiền cọc (30%):</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold", color: "#fa8c16" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(depositPrice)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, textAlign: "left", fontWeight: "bold" }}>Tổng thanh toán:</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold", color: "#52c41a", fontSize: 16 }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(totalPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            );
          })()}
          <p style={{ marginTop: 16, fontSize: 12, color: "#666", fontStyle: "italic" }}>
            Ghi chú: Tiền cọc (30%) sẽ được trừ vào khoản thanh toán cuối cùng khi khách hàng hoàn trả xe.
          </p>
          <Divider />
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              type="primary"
              size="large"
              icon={<DollarOutlined />}
              onClick={handlePayment}
              loading={isPaymentProcessing}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", minWidth: 200 }}
            >
              Xử lý thanh toán
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 40, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <p><b>XÁC NHẬN CỦA CÁC BÊN:</b></p>
          <table style={{ width: "100%", marginTop: 20 }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", paddingRight: 20, textAlign: "center" }}>
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: 30 }}>BÊN CHO THUÊ</p>
                    <p style={{ marginBottom: 40, fontSize: 12, color: "#666" }}>(Người đại diện công ty)</p>
                    <div style={{ minHeight: 60, borderBottom: "1px solid #333", marginBottom: 10 }}></div>
                    <p style={{ fontSize: 12 }}>Ký tên & Dấu</p>
                    <p style={{ fontSize: 12, marginTop: 8, color: "#666" }}>Ngày: ___/___/______</p>
                  </div>
                </td>
                <td style={{ width: "50%", paddingLeft: 20, textAlign: "center" }}>
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: 30 }}>BÊN THUÊ</p>
                    <p style={{ marginBottom: 40, fontSize: 12, color: "#666" }}>({o.renterName})</p>
                    <div style={{ minHeight: 60, borderBottom: "1px solid #333", marginBottom: 10 }}></div>
                    <p style={{ fontSize: 12 }}>Ký tên</p>
                    <p style={{ fontSize: 12, marginTop: 8, color: "#666" }}>Ngày: ___/___/______</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card
        title={`Hợp đồng trực tuyến #${orderId}`}
        extra={
          <Space>
            {!isSigned && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleSignContract}
                disabled={loading}
              >
                Ký điện tử
              </Button>
            )}
            {isSigned && (
              <Button type="primary" icon={<CheckOutlined />} disabled>
                Đã ký
              </Button>
            )}
            {!isContractSent && (
              <Button
                type="primary"
                onClick={handleSendToRenter}
                disabled={loading || isSending}
                loading={isSending}
              >
                Gửi cho renter
              </Button>
            )}
            {isContractSent && (
              <Button type="primary" disabled>
                ✓ Đã gửi
              </Button>
            )}
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Đang tải thông tin đơn..." />
          </div>
        ) : (
          renderContract()
        )}
      </Card>

      <Modal
        title="Ký hợp đồng điện tử"
        open={signatureModal}
        onOk={handleConfirmSignature}
        onCancel={() => setSignatureModal(false)}
        okText="Xác nhận ký"
        cancelText="Hủy"
        confirmLoading={isSigning}
      >
        <p style={{ marginBottom: 16 }}>
          Vui lòng nhập họ tên của bạn để ký hợp đồng điện tử:
        </p>
        <Input
          placeholder="Nhập họ tên (chữ ký)"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          onPressEnter={handleConfirmSignature}
          autoFocus
        />
        <p style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
          Chữ ký của bạn sẽ được lưu vào hợp đồng với thời gian hiện tại.
        </p>
      </Modal>

      <Modal
        title="Thông tin thanh toán"
        open={paymentModal}
        onOk={handlePaymentWithDetails}
        onCancel={() => {
          setPaymentModal(false);
          setPaymentForm({ fullName: "", description: "" });
        }}
        okText="Thanh toán"
        cancelText="Hủy"
        confirmLoading={isPaymentProcessing}
      >
        <Form form={form} layout="vertical">
          <FormItem label="Tên khách hàng" required>
            <Input
              placeholder="Nhập tên khách hàng"
              value={paymentForm.fullName}
              onChange={(e) => setPaymentForm({ ...paymentForm, fullName: e.target.value })}
            />
          </FormItem>
          <FormItem label="Mô tả">
            <Input.TextArea
              placeholder="Nhập mô tả (không bắt buộc)"
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
              rows={4}
            />
          </FormItem>
        </Form>
      </Modal>
    </>
  );
}
