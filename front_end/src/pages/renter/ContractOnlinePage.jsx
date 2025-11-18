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
  const { createPayment, handlePaymentReturn } = usePayment();
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
          renterName: userInfo?.fullName || renter?.fullName || orderData.renterName || "(N/A)",
          renterPhone: renter?.phoneNumber || orderData.renterPhone || "(N/A)",
          renterEmail: renter?.email || orderData.renterEmail || "(N/A)",
          renterIdNumber: renter?.cccd || "(N/A)",
          vehicleName: (vehicleModel?.brandName && vehicle?.model) ? `${vehicleModel.brandName} ${vehicle.model}` : vehicle?.vehicleName || "(N/A)",
          vehicleLicensePlate: vehicle?.licensePlate || "(N/A)",
          pricePerHour: vehicleModel?.price_per_hour || 0,
          pickupStationName: "(N/A)",
          returnStationName: "(N/A)",
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
        //Can't load contract information
        console.error("Error fetching order for renter contract:", err);
        setError("Unable to load contract information.");
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
          // Mark order as waiting for staff handover approval
          try {
            await axiosInstance.put(`/api/RentalOrders/${orderId}`, { status: "PENDING_HANDOVER" });
          } catch (err) {
            console.debug('Could not set PENDING_HANDOVER:', err?.response?.status || err.message);
          }
        } else if (result?.status === 'PAID' || result?.isPaid || result?.success) {
          setPaymentSuccessHtml(`<div style="padding:20px;font-family:Arial"><h2 style="color:#52c41a">Payment successful</h2><p>Order ID: #${orderId}</p></div>`);
          // Mark order as waiting for staff handover approval
          try {
            await axiosInstance.put(`/api/RentalOrders/${orderId}`, { status: "PENDING_HANDOVER" });
          } catch (err) {
            console.debug('Could not set PENDING_HANDOVER:', err?.response?.status || err.message);
          }
        } else {
          setReturnResultMessage(JSON.stringify(result));
          message.info('Result returned: ' + (result?.message || 'See details in the modal.'));
        }
      } catch (err) {
        console.error('Error verifying VNPay return:', err);
        message.error('Unable to verify payment result.');
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
      message.success("Contract signed successfully!");
      setSignatureModal(false);
    } catch (err) {
      console.error("Error saving signature:", err);
      message.error("Unable to save signature. Please try again.");
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
      const fullName = order.renterName || "(N/A)";

      console.log("🔵 Starting payment creation with:", { orderId, totalPrice, fullName, paymentDescription });
      const response = await createPayment(orderId, totalPrice, "rental", fullName, paymentDescription);
      console.log("🟢 Payment response received:", response);

      // Normalize response: server may return JSON object or string (text). The API returns { url: string, orderId }
      console.debug("createPayment returned:", response);
      let resp = response;
      if (typeof resp === 'string') {
        const t = resp.trim();
        // If it's HTML, show it
        if (t.startsWith('<')) {
          console.log("🟡 Backend returned HTML (likely error page)");
          setPaymentSuccessHtml(resp);
          setPaymentModal(false);
          return;
        }
        // Try parse JSON
        try {
          resp = JSON.parse(resp);
        } catch (e) {
          // not JSON - show raw
          console.log("🟡 Backend returned non-JSON string");
          setPaymentSuccessHtml(resp);
          setPaymentModal(false);
          return;
        }
      }

      // If backend returns 'url' field (as your API does), redirect to it IMMEDIATELY
      if (resp && (resp.url || resp.paymentUrl)) {
        const redirectTo = resp.url || resp.paymentUrl;
        console.log("🔴 Redirecting to VNPay:", redirectTo);
        // Use immediate redirect - do NOT wait for anything
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
          <h2 style="color: #52c41a;">Payment successful</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer Name:</strong> ${fullName}</p>
          <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
          ${paymentId ? `<p><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
          <p><strong>Time:</strong> ${new Date(createdAt).toLocaleString('en-US')}</p>
          <hr />
          <p>If you need a detailed receipt, please check the payment history or contact support.</p>
        </div>
      `;

      setPaymentSuccessHtml(generatedHtml);
      setPaymentModal(false);
      message.success("Payment successful.");
      
      // Mark order as waiting for staff handover approval instead of marking IN_USE
      try {
        await axiosInstance.put(`/RentalOrders/${orderId}`, { status: "PENDING_HANDOVER" });
      } catch (err) {
        console.debug('Could not set PENDING_HANDOVER after payment:', err?.response?.status || err.message);
      }
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
        message.error(`Server error (${status}): ${typeof respData === 'string' ? respData : JSON.stringify(respData)}`);
      } else {
        message.error(`Cannot complete payment. Error: ${err.message}`);
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
    if (!order) return <div style={{ padding: 20 }}>Loading data...</div>;

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
          <h2>RENTAL CONTRACT</h2>
          <p>Order ID: #{orderId}</p>
          {isSigned && <Tag color="green">✓ Signed</Tag>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Customer:</b> {o.renterName}</p>
          <p><b>Phone:</b> {o.renterPhone}</p>
          <p><b>Email:</b> {o.renterEmail}</p>
          <p><b>ID Number:</b> {o.renterIdNumber}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Vehicle name:</b> {o.vehicleName}</p>
          <p><b>License plate:</b> {o.vehicleLicensePlate}</p>
        </div>

        <div style={{ marginTop: 30, backgroundColor: "#f5f5f5", padding: 20, borderRadius: 8 }}>
          <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>PRICE BREAKDOWN</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Price per hour</div>
            <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricePerHour)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div>Number of hours</div>
                <div style={{ fontWeight: 700 }}>{rentalHours.toFixed(2)} hours</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div>Rental fee</div>
            <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rentalPrice)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div>Deposit (30%)</div>
                <div style={{ fontWeight: 700, color: '#fa8c16' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(depositPrice)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 16, fontWeight: 800 }}>
            <div>Total Payment</div>
            <div style={{ color: '#52c41a' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <p><b>Basic terms:</b></p>
              <ol>
                <li>The renter agrees to pick up the vehicle at the specified time and location.</li>
                <li>The renter is responsible for any damages or accidents during the rental period.</li>
                <li>The vehicle must be returned on time; late returns will incur penalties.</li>
              </ol>
        </div>
        <div style={{ marginTop: 28, textAlign: "center" }}>
          {
            isOrderPaid(o) ? (
              <div>
                <Tag color="green">Paid</Tag>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => navigate(`/renter/pickup/${orderId}`)}>Pick up</Button>
                </div>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={() => setPaymentModal(true)}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", minWidth: 220 }}
              >
                Pay {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
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
        title={`Contract #${orderId}`}
        extra={
          <Space>
            <Button
              onClick={() => contractRef.current && contractRef.current.scrollIntoView({ behavior: 'smooth' })}
            >
              Contract
            </Button>
            {isOrderPaid(order) && (
              <Button
                type="primary"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => navigate(`/renter/pickup/${orderId}`)}
              >
                Pick up
              </Button>
            )}
            <Button onClick={() => window.print()}>🖨️ Print</Button>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin tip="Loading..." /></div>
        ) : (
          renderContract()
        )}
      </Card>
      <Modal
        title="Confirm Payment"
        open={paymentModal}
        onOk={handleSubmitPayment}
        onCancel={() => { setPaymentModal(false); setPaymentDescription(""); }}
        okText="Confirm & Pay"
        cancelText="Cancel"
        confirmLoading={isPaymentProcessing}
        width={700}
      >
        {order && (
          <div>
            <p><b>Order ID:</b> #{orderId}</p>
            <p><b>Customer Name:</b> {order.renterName || "(N/A)"}</p>
            <p><b>Amount:</b> {formatCurrency(getTotalPrice(order))}</p>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600 }}>Description (optional)</label>
              <Input.TextArea rows={4} value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} placeholder="Enter description..." />
            </div>
          </div>
        )}
      </Modal>

      {/* If backend returned success HTML to display */}
      <Modal
        title="Payment Result"
        open={!!paymentSuccessHtml}
        onOk={() => setPaymentSuccessHtml(null)}
        onCancel={() => setPaymentSuccessHtml(null)}
        footer={null}
        width={800}
      >
        <div dangerouslySetInnerHTML={{ __html: paymentSuccessHtml || "<p>Payment successful.</p>" }} />
      </Modal>
    </>
  );
}
