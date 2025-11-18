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
          : vehicle?.vehicleName || "(N/A)";

        // Step 5: Merge all data
        const mergedOrder = {
          ...orderData,
          // Renter info
          renterName: userInfo?.fullName || renter?.fullName || "(N/A)",
          renterPhone: userInfo?.phoneNumber || renter?.phoneNumber || "(N/A)",
          renterEmail: userInfo?.email || renter?.email || "(N/A)",
          renterIdNumber: cccdInfo?.id_Card_Number || renter?.cccd || "(N/A)",
          // Vehicle info
          vehicleName,
          vehicleLicensePlate: vehicle?.licensePlate || "(N/A)",
          vehicleColor: vehicleModel?.vehicleColor || vehicle?.vehicleColor || "(N/A)",
          pricePerHour: vehicleModel?.price_per_hour || 0,
          // Station info
          pickupStationName: pickupStationRes?.data?.stationName || "(N/A)",
          returnStationName: returnStationRes?.data?.stationName || "(N/A)",
        };

        console.log("Merged Order:", mergedOrder);
        setOrder(mergedOrder);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Cannot load order data. Please try again.");
        message.error("Cannot load order data.");
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
      message.error("Please enter signature!");
      return;
    }
    setIsSigning(true);
    
    // Simulate API call to save signature
    setTimeout(() => {
      setIsSigned(true);
      setIsSigning(false);
      setSignatureModal(false);
      message.success("Contract signed successfully!");
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
      message.success("Contract sent to customer!");
    } catch (err) {
      console.error("❌ Error sending contract:", err);
      console.error("Response status:", err?.response?.status);
      console.error("Response data:", err?.response?.data);
      message.error(`Cannot send contract: ${err?.response?.data?.message || err.message}`);
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
      message.error("Please enter customer name!");
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
        message.error("Cannot initialize VNPay payment");
      }

      setPaymentModal(false);
      setPaymentForm({ fullName: "", description: "" });
    } catch (err) {
      console.error("Payment error:", err);
      message.error("Error processing payment");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const renderContract = () => {
    if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;
    if (!order) return <div style={{ padding: 20 }}>No contract data available.</div>;

    const o = order;

    return (
      <div ref={contractRef} style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2>ONLINE RENTAL CONTRACT</h2>
            <p>Order ID: #{orderId}</p>
          {isSigned && (
            <Tag color="green" style={{ marginTop: 10 }}>
                ✓ Signed
            </Tag>
          )}
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
          <p><b>Color:</b> {o.vehicleColor}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Rental period:</b></p>
          <p style={{ marginLeft: 20 }}>
            From: {o.startTime ? dayjs(o.startTime).format("DD/MM/YYYY HH:mm") : "(N/A)"}
          </p>
          <p style={{ marginLeft: 20 }}>
            To: {o.endTime ? dayjs(o.endTime).format("DD/MM/YYYY HH:mm") : "(N/A)"}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Pick-up station:</b> {o.pickupStationName}</p>
          <p><b>Return station:</b> {o.returnStationName}</p>
          <p><b>Created At:</b> {o.createdAt ? dayjs(o.createdAt).format("DD/MM/YYYY HH:mm") : "(N/A)"}</p>
          <p><b>Status:</b> {o.status === "APPROVED" ? "Approved" : o.status || "(N/A)"}</p>
        </div>

        <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <p><b>Basic terms:</b></p>
          <ol style={{ marginLeft: 20 }}>
            <li>The renter agrees to pick up the vehicle at the specified time and location.</li>
            <li>Rental fees and payment terms are governed by the rental contract.</li>
            <li>The renter is responsible for any damages or accidents during the rental period.</li>
            <li>Any modifications must be confirmed in writing by both parties.</li>
            <li>The vehicle must be returned on time; late returns will incur penalties.</li>
          </ol>
        </div>

        <div style={{ marginTop: 30, backgroundColor: "#f5f5f5", padding: 20, borderRadius: 8 }}>
          <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>PRICE BREAKDOWN</p>
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
                    <td style={{ padding: 12, textAlign: "left" }}>Price per hour:</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(pricePerHour)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Number of hours:</td>
                      <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                      {rentalHours.toFixed(2)} hours
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Rental fee:</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(rentalPrice)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: 12, textAlign: "left" }}>Deposit (30%):</td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: "bold", color: "#fa8c16" }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(depositPrice)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12, textAlign: "left", fontWeight: "bold" }}>Total Payment:</td>
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
            Note: The deposit (30%) will be deducted from the final payment when the vehicle is returned.
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
              Process Payment
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 40, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <p><b>CONFIRMATION BY PARTIES:</b></p>
          <table style={{ width: "100%", marginTop: 20 }}>
            <tbody>
              <tr>
                    <td style={{ width: "50%", paddingRight: 20, textAlign: "center" }}>
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: 30 }}>LESSOR</p>
                      <p style={{ fontWeight: "bold", marginBottom: 30 }}>LESSOR</p>
                    <p style={{ marginBottom: 40, fontSize: 12, color: "#666" }}>(Company representative)</p>
                    <div style={{ minHeight: 60, borderBottom: "1px solid #333", marginBottom: 10 }}></div>
                    <p style={{ fontSize: 12 }}>Signature & Stamp</p>
                    <p style={{ fontSize: 12, marginTop: 8, color: "#666" }}>Date: ___/___/______</p>
                  </div>
                </td>
                <td style={{ width: "50%", paddingLeft: 20, textAlign: "center" }}>
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: 30 }}>LESSEE</p>
                      <p style={{ fontWeight: "bold", marginBottom: 30 }}>LESSEE</p>
                    <p style={{ marginBottom: 40, fontSize: 12, color: "#666" }}>({o.renterName})</p>
                    <div style={{ minHeight: 60, borderBottom: "1px solid #333", marginBottom: 10 }}></div>
                    <p style={{ fontSize: 12 }}>Signature</p>
                    <p style={{ fontSize: 12, marginTop: 8, color: "#666" }}>Date: ___/___/______</p>
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
        title={`Online contract #${orderId}`}
        extra={
          <Space>
            {!isSigned && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleSignContract}
                disabled={loading}
              >
                Sign Online
              </Button>
            )}
            {isSigned && (
              <Button type="primary" icon={<CheckOutlined />} disabled>
                 Signed
              </Button>
            )}
                {!isContractSent && (
              <Button
                type="primary"
                onClick={handleSendToRenter}
                disabled={loading || isSending}
                loading={isSending}
              >
                Send to renter
              </Button>
            )}
            {isContractSent && (
              <Button type="primary" disabled>
                ✓ Sent
              </Button>
            )}
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Loading order data..." />
          </div>
        ) : (
          renderContract()
        )}
      </Card>

      <Modal
        title="Sign contract online"
        open={signatureModal}
        onOk={handleConfirmSignature}
        onCancel={() => setSignatureModal(false)}
        okText="Confirm Sign"
        cancelText="Cancel"
        confirmLoading={isSigning}
      >
        <p style={{ marginBottom: 16 }}>
          Please enter your full name to sign the online contract:
        </p>
        <Input
          placeholder="Enter full name (signature)"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          onPressEnter={handleConfirmSignature}
          autoFocus
        />
        <p style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
          Your signature will be saved on the contract with the current timestamp.
        </p>
      </Modal>

      <Modal
        title="Payment information"
        open={paymentModal}
        onOk={handlePaymentWithDetails}
        onCancel={() => {
          setPaymentModal(false);
          setPaymentForm({ fullName: "", description: "" });
        }}
        okText="Pay"
        cancelText="Cancel"
        confirmLoading={isPaymentProcessing}
      >
        <Form form={form} layout="vertical">
          <FormItem label="Customer Name" required>
            <Input
              placeholder="Enter customer name"
              value={paymentForm.fullName}
              onChange={(e) => setPaymentForm({ ...paymentForm, fullName: e.target.value })}
            />
          </FormItem>
          <FormItem label="Description">
            <Input.TextArea
              placeholder="Enter description (optional)"
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
