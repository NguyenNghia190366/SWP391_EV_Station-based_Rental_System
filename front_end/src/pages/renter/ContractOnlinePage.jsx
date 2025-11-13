import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Space, message, Spin, Modal, Tag, Input } from "antd";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { usePayment } from "@/hooks/usePayment";
import SignaturePad from "react-signature-canvas";

export default function ContractOnlinePage() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccessHtml, setPaymentSuccessHtml] = useState(null);
  const sigPadRef = useRef(null);
  const contractRef = useRef();
  const axiosInstance = useAxiosInstance();
  const { createPayment } = usePayment();
  const { handlePaymentReturn } = usePayment();
  const { updateOrderStatusToInUse } = usePayment();
  const location = useLocation();
  const navigate = useNavigate();
  const [returnProcessing, setReturnProcessing] = useState(false);
  const [returnResultMessage, setReturnResultMessage] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const orderRes = await axiosInstance.get(`/RentalOrders/${orderId}`);
        const orderData = orderRes.data;

        // Fetch minimal related data
        const [vehicleRes, rentersRes, vehicleModelRes, stationsRes] = await Promise.all([
          axiosInstance.get(`/Vehicles/${orderData.vehicleId}`).catch(() => null),
          axiosInstance.get(`/Renters`).catch(() => ({ data: [] })),
          // We'll try to fetch model by ID after getting vehicle
          Promise.resolve(null),
          axiosInstance.get(`/Stations`).catch(() => ({ data: [] })),
        ]);

        const vehicle = vehicleRes?.data || null;
        const renters = Array.isArray(rentersRes?.data) ? rentersRes.data : [];

        // try get vehicle model
        let vehicleModel = null;
        if (vehicle?.vehicleModelId) {
          try {
            const vmRes = await axiosInstance.get(`/VehicleModels/${vehicle.vehicleModelId}`);
            vehicleModel = vmRes.data;
          } catch (err) {
            vehicleModel = null;
          }
        }

        // find renter info
        const renter = Array.isArray(renters) ? renters.find(r => r.renterId === orderData.renterId) : null;
        // Prefer authoritative full name from Users table when available
        let userInfo = null;
        if (renter?.userId) {
          try {
            const uRes = await axiosInstance.get(`/Users/${renter.userId}`);
            userInfo = uRes.data;
          } catch (err) {
            userInfo = null;
          }
        }

        const mergedOrder = {
          ...orderData,
          renterName: userInfo?.fullName || renter?.fullName || orderData.renterName || "(Không có)",
          renterPhone: renter?.phoneNumber || orderData.renterPhone || "(Không có)",
          renterEmail: renter?.email || orderData.renterEmail || "(Không có)",
          renterIdNumber: renter?.cccd || "(Không có)",
          vehicleName: (vehicleModel?.brandName && vehicle?.model) ? `${vehicleModel.brandName} ${vehicle.model}` : vehicle?.vehicleName || "(Không có)",
          vehicleLicensePlate: vehicle?.licensePlate || "(Không có)",
          pricePerHour: vehicleModel?.price_per_hour || 0,
          pickupStationName: "(Không có)",
          returnStationName: "(Không có)",
        };

        // stations
        try {
          if (mergedOrder.pickupStationId) {
            const s = await axiosInstance.get(`/Stations/${mergedOrder.pickupStationId}`);
            mergedOrder.pickupStationName = s.data?.stationName || mergedOrder.pickupStationName;
          }
          if (mergedOrder.returnStationId) {
            const s2 = await axiosInstance.get(`/Stations/${mergedOrder.returnStationId}`);
            mergedOrder.returnStationName = s2.data?.stationName || mergedOrder.returnStationName;
          }
        } catch (err) {
          // ignore
        }

        setOrder(mergedOrder);
        // Try to fetch payments for this order (match DB column name: payment_status, order_id)
        try {
          const payRes = await axiosInstance.get(`/Payments?order_id=${orderId}`);
          const payData = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
          const hasPaid = payData.some(p => {
            const t = (p.type_payment || p.typePayment || p.typePayment || '').toString().toUpperCase();
            const s = (p.payment_status || p.paymentStatus || p.PaymentStatus || '').toString().toUpperCase();
            // consider only PAY records (not REFUND) marked as PAID
            return (t === 'PAY' || t === 'PAY') && s === 'PAID';
          });
          mergedOrder.isPaid = hasPaid;
        } catch (err) {
          // ignore if payments endpoint isn't available
          mergedOrder.isPaid = mergedOrder.isPaid || false;
        }
        // If the order indicates the vehicle is currently being used, mark vehicle as unavailable
        try {
          const now = new Date();
          const start = mergedOrder.startTime ? new Date(mergedOrder.startTime) : null;
          const end = mergedOrder.endTime ? new Date(mergedOrder.endTime) : null;
          const isCurrentlyRented = (mergedOrder.status === 'IN_USE') ||
            (mergedOrder.status === 'APPROVED' && start && end && start <= now && now <= end);

          if (isCurrentlyRented && vehicle) {
            // prepare a vehicle payload - keep existing fields but set isAvailable to false
            const vid = vehicle.vehicleId || mergedOrder.vehicleId;
            const updatedVehicle = { ...vehicle, isAvailable: false, is_available: false };
            try {
              await axiosInstance.put(`/Vehicles/${vid}`, updatedVehicle);
              // reflect locally
              mergedOrder.vehicleIsAvailable = false;
            } catch (err) {
              // non-fatal - backend might not allow update from this user
              console.debug('Could not update vehicle availability:', err?.response?.status || err.message);
            }
          }
        } catch (err) {
          // ignore
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching order for renter contract:", err);
        setError("Không thể tải thông tin hợp đồng.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderData();
  }, [orderId, axiosInstance]);

  // If we are redirected back from VNPay, the URL may contain vnp_... query params.
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (!qs) return;
    // check for VNPay params
    const hasVnp = Array.from(qs.keys()).some(k => k.startsWith('vnp_'));
    if (!hasVnp) return;

    const paramsObj = {};
    qs.forEach((v, k) => (paramsObj[k] = v));

    (async () => {
      try {
        setReturnProcessing(true);
        // call backend to verify payment result
        const result = await handlePaymentReturn(paramsObj);
        console.debug('handlePaymentReturn result:', result);
        // if backend sent HTML, show it; otherwise show friendly message
        if (typeof result === 'string' && result.trim().startsWith('<')) {
          setPaymentSuccessHtml(result);
          // Update order status to IN_USE after successful VNPay return
          await updateOrderStatusToInUse(orderId);
        } else if (result?.status === 'PAID' || result?.isPaid || result?.success) {
          setPaymentSuccessHtml(`<div style="padding:20px;font-family:Arial"><h2 style="color:#52c41a">Thanh toán thành công</h2><p>Mã đơn: #${orderId}</p></div>`);
          // Update order status to IN_USE after successful payment
          await updateOrderStatusToInUse(orderId);
        } else {
          setReturnResultMessage(JSON.stringify(result));
          message.info('Kết quả trả về: ' + (result?.message || 'Xem chi tiết trong modal.'));
        }
      } catch (err) {
        console.error('Error verifying VNPay return:', err);
        message.error('Không thể xác minh kết quả thanh toán.');
      } finally {
        setReturnProcessing(false);
      }
    })();
  }, [location.search]);


  const handleSaveSignature = async () => {
    if (!sigPadRef.current) return;
    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");
    setIsSigning(true);
    try {
      // Try to persist signature by updating rental order with a renterSignature field.
      // Backend may ignore unknown field — adjust to your API if needed.
      await axiosInstance.put(`/RentalOrders/${orderId}`, {
        renterSignature: dataUrl,
        renterSignatureDate: new Date().toISOString(),
      });
      setIsSigned(true);
      message.success("Đã ký hợp đồng thành công!");
      setSignatureModal(false);
    } catch (err) {
      console.error("Error saving signature:", err);
      message.error("Không thể lưu chữ ký. Vui lòng thử lại.");
    } finally {
      setIsSigning(false);
    }
  };

  // Payment handlers (renter)
  const handleSubmitPayment = async () => {
    if (!order) return;

    setIsPaymentProcessing(true);
    try {
      const startTime = order.startTime ? dayjs(order.startTime) : null;
      const endTime = order.endTime ? dayjs(order.endTime) : null;
      const rentalHours = startTime && endTime ? endTime.diff(startTime, 'hour', true) : 0;
      const pricePerHour = order.pricePerHour || 0;
      const rentalPrice = rentalHours * pricePerHour;
      const depositPrice = rentalPrice * 0.3;
      const totalPrice = rentalPrice + depositPrice;

      // use full name from order (from DB) and the description entered by renter
      const fullName = order.renterName || "(Không có)";

      const response = await createPayment(orderId, totalPrice, "rental", fullName, paymentDescription);

      // Normalize response: server may return JSON object or string (text). The API returns { url: string, orderId }
      console.debug("createPayment returned:", response);
      let resp = response;
      if (typeof resp === 'string') {
        const t = resp.trim();
        // If it's HTML, show it
        if (t.startsWith('<')) {
          setPaymentSuccessHtml(resp);
          setPaymentModal(false);
          return;
        }
        // Try parse JSON
        try {
          resp = JSON.parse(resp);
        } catch (e) {
          // not JSON - show raw
          setPaymentSuccessHtml(resp);
          setPaymentModal(false);
          return;
        }
      }

      // If backend returns 'url' field (as your API does), redirect to it
      if (resp && (resp.url || resp.paymentUrl)) {
        const redirectTo = resp.url || resp.paymentUrl;
        window.location.href = redirectTo;
        return;
      }

      // If backend returns HTML content, display it
      const html = response?.html || response?.paymentHtml || response?.successHtml || null;
      if (html) {
        setPaymentSuccessHtml(html);
        setPaymentModal(false);
        return;
      }

      // If backend returned JSON without HTML, render a simple success HTML on the client
      const paymentId = response?.paymentId || response?.id || response?.orderId || null;
      const amount = response?.amount || totalPrice;
      const createdAt = response?.createdAt || new Date().toISOString();
      const generatedHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #52c41a;">Thanh toán thành công</h2>
          <p><strong>Mã đơn:</strong> ${orderId}</p>
          <p><strong>Tên khách hàng:</strong> ${fullName}</p>
          <p><strong>Số tiền:</strong> ${formatCurrency(amount)}</p>
          ${paymentId ? `<p><strong>Mã thanh toán:</strong> ${paymentId}</p>` : ''}
          <p><strong>Thời gian:</strong> ${new Date(createdAt).toLocaleString('vi-VN')}</p>
          <hr />
          <p>Nếu bạn cần biên lai chi tiết, vui lòng kiểm tra trang lịch sử thanh toán hoặc liên hệ hỗ trợ.</p>
        </div>
      `;

      setPaymentSuccessHtml(generatedHtml);
      setPaymentModal(false);
      message.success("Thanh toán thành công.");
      
      // Update order status to IN_USE after successful payment
      await updateOrderStatusToInUse(orderId);
    } catch (err) {
      console.error("Error creating payment:", err);
      // If backend returned HTML or a message in response.data, show it directly
      const respData = err?.response?.data;
      const status = err?.response?.status;
      if (respData) {
        // If it's a string that looks like HTML, show it in the success modal for debugging
        if (typeof respData === 'string' && respData.trim().startsWith('<')) {
          setPaymentSuccessHtml(respData);
          setPaymentModal(false);
          return;
        }
        // Otherwise show details
        message.error(`Lỗi server (${status}): ${typeof respData === 'string' ? respData : JSON.stringify(respData)}`);
      } else {
        message.error(`Không thể thực hiện thanh toán. Lỗi: ${err.message}`);
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const getTotalPrice = (o) => {
    if (!o) return 0;
    const startTime = o.startTime ? dayjs(o.startTime) : null;
    const endTime = o.endTime ? dayjs(o.endTime) : null;
    const rentalHours = startTime && endTime ? endTime.diff(startTime, 'hour', true) : 0;
    const pricePerHour = o.pricePerHour || 0;
    const rentalPrice = rentalHours * pricePerHour;
    const depositPrice = rentalPrice * 0.3;
    return rentalPrice + depositPrice;
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const isOrderPaid = (o) => {
    if (!o) return false;
    // Check order status flags
    const st = (o.status || '').toString().toLowerCase();
    if (st === 'payment_completed' || st === 'paid' || st.includes('paid')) return true;

    // Check payments array (different backends may return Payments or payments)
    const pays = Array.isArray(o.Payments) ? o.Payments : Array.isArray(o.payments) ? o.payments : [];
    if (pays && pays.length) {
      return pays.some(p => {
        const ps = (p.paymentStatus || p.PaymentStatus || '').toString().toUpperCase();
        return ps === 'PAID' || ps === 'PAID';
      });
    }

    return false;
  };

  const renderContract = () => {
    if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;
    if (!order) return <div style={{ padding: 20 }}>Đang tải dữ liệu...</div>;

    const o = order;
    const startTime = o.startTime ? dayjs(o.startTime) : null;
    const endTime = o.endTime ? dayjs(o.endTime) : null;
    const rentalHours = startTime && endTime ? endTime.diff(startTime, 'hour', true) : 0;
    const pricePerHour = o.pricePerHour || 0;
    const rentalPrice = rentalHours * pricePerHour;
    const depositPrice = rentalPrice * 0.3;
    const totalPrice = rentalPrice + depositPrice;

    return (
      <div ref={contractRef} style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2>HỢP ĐỒNG THUÊ XE</h2>
          <p>Mã đơn: #{orderId}</p>
          {isSigned && <Tag color="green">✓ Đã ký</Tag>}
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
        </div>

        <div style={{ marginTop: 30, backgroundColor: "#f5f5f5", padding: 20, borderRadius: 8 }}>
          <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>BẢNG TÍNH CHI PHÍ</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Giá thuê / giờ</div>
            <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricePerHour)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div>Số giờ thuê</div>
            <div style={{ fontWeight: 700 }}>{rentalHours.toFixed(2)} giờ</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div>Tiền thuê xe</div>
            <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rentalPrice)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div>Tiền cọc (30%)</div>
            <div style={{ fontWeight: 700, color: '#fa8c16' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(depositPrice)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 16, fontWeight: 800 }}>
            <div>Tổng thanh toán</div>
            <div style={{ color: '#52c41a' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <p><b>Điều khoản cơ bản:</b></p>
          <ol>
            <li>Bên thuê cam kết nhận xe đúng thời gian và địa điểm quy định.</li>
            <li>Bên thuê chịu trách nhiệm về mọi hư hỏng và tai nạn trong thời gian sử dụng.</li>
            <li>Phải trả xe đúng thời gian, nếu trễ sẽ chịu phí phạt.</li>
          </ol>
        </div>
        <div style={{ marginTop: 28, textAlign: "center" }}>
          {
            isOrderPaid(o) ? (
              <div>
                <Tag color="green">Đã thanh toán</Tag>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => navigate(`/renter/pickup/${orderId}`)}>Nhận xe</Button>
                </div>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={() => setPaymentModal(true)}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", minWidth: 220 }}
              >
                Thanh toán {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
              </Button>
            )
          }
        </div>
      </div>
    );
  };

  return (
    <>
      <Card
        title={`Hợp đồng #${orderId}`}
        extra={
          <Space>
            <Button
              onClick={() => contractRef.current && contractRef.current.scrollIntoView({ behavior: 'smooth' })}
              disabled={isOrderPaid(order)}
            >
              Hợp đồng
            </Button>
            <Button onClick={() => window.print()}>🖨️ In</Button>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin tip="Đang tải..." /></div>
        ) : (
          renderContract()
        )}
      </Card>
      <Modal
        title="Xác nhận thanh toán"
        open={paymentModal}
        onOk={handleSubmitPayment}
        onCancel={() => { setPaymentModal(false); setPaymentDescription(""); }}
        okText="Xác nhận và thanh toán"
        cancelText="Hủy"
        confirmLoading={isPaymentProcessing}
        width={700}
      >
        {order && (
          <div>
            <p><b>Mã đơn:</b> #{orderId}</p>
            <p><b>Tên khách hàng:</b> {order.renterName || "(Không có)"}</p>
            <p><b>Số tiền:</b> {formatCurrency(getTotalPrice(order))}</p>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600 }}>Mô tả (thêm thông tin thanh toán, không bắt buộc)</label>
              <Input.TextArea rows={4} value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} placeholder="Nhập mô tả..." />
            </div>
          </div>
        )}
      </Modal>

      {/* If backend returned success HTML to display */}
      <Modal
        title="Kết quả thanh toán"
        open={!!paymentSuccessHtml}
        onOk={() => setPaymentSuccessHtml(null)}
        onCancel={() => setPaymentSuccessHtml(null)}
        footer={null}
        width={800}
      >
        <div dangerouslySetInnerHTML={{ __html: paymentSuccessHtml || "<p>Thanh toán thành công.</p>" }} />
      </Modal>
    </>
  );
}
