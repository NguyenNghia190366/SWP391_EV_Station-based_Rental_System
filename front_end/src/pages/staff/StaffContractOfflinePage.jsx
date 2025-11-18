import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Space, message, Spin, Tag } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function StaffContractOfflinePage() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const contractRef = useRef();
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const orderRes = await axiosInstance.get(`/RentalOrders/${orderId}`);
        const orderData = orderRes.data;
        console.log("Order:", orderData);

        // Call all APIs in parallel
        const [rentersRes, vehiclesRes, vehicleModelsRes, cccdsRes] = await Promise.all([
          axiosInstance.get(`/Renters`),
          axiosInstance.get(`/Vehicles`),
          axiosInstance.get(`/VehicleModels`),
          axiosInstance.get(`/Cccds`),
        ]);

        const rentersData = Array.isArray(rentersRes.data) ? rentersRes.data : [];
        const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
        const vehicleModelsData = Array.isArray(vehicleModelsRes.data) ? vehicleModelsRes.data : [];
        const cccdsData = Array.isArray(cccdsRes.data) ? cccdsRes.data : [];

        // Find matching renter
        const renter = rentersData.find((r) => r.renterId === orderData.renterId);
        
        // Get CCCD
        const cccd = cccdsData.find((c) => c.renter_Id === orderData.renterId);

        // Get user info
        let userInfo = {};
        if (renter?.userId) {
          try {
            const userRes = await axiosInstance.get(`/Users/${renter.userId}`);
            userInfo = userRes.data || {};
          } catch (err) {
            console.error("Error fetching user:", err);
          }
        }

        // Find vehicle and model
        const vehicle = vehiclesData.find((v) => v.vehicleId === orderData.vehicleId);
        const vehicleModel = vehicleModelsData.find((vm) => vm.vehicleModelId === vehicle?.vehicleModelId);

        // Compose vehicle name
        const composedVehicleName = vehicleModel && vehicle
          ? `${vehicleModel.brandName} ${vehicle.model}`
          : vehicle?.vehicleName || orderData?.vehicleName || "(N/A)";

        // Merge data
        const mergedOrder = {
          ...orderData,
          renterName: userInfo?.fullName || renter?.fullName || "(N/A)",
          renterPhone: userInfo?.phoneNumber || renter?.phoneNumber || "(N/A)",
          renterEmail: userInfo?.email || renter?.email || "(N/A)",
          renterIdNumber: cccd?.id_Card_Number || renter?.cccd || "(N/A)",
          vehicleName: composedVehicleName,
          vehicleLicensePlate: vehicle?.licensePlate || "(N/A)",
          vehicleColor: vehicle?.vehicleColor || "(N/A)",
          pricePerHour: vehicleModel?.price_per_hour || 0,
          pickupStationId: orderData?.pickupStationId || 0,
          returnStationId: orderData?.returnStationId || 0,
        };

        // Get station names
        const stationCalls = [];
        if (mergedOrder.pickupStationId) {
          stationCalls.push(
            axiosInstance.get(`/Stations/${mergedOrder.pickupStationId}`)
              .then((res) => ({ type: "pickup", data: res.data }))
              .catch(() => ({ type: "pickup", data: null }))
          );
        }
        if (mergedOrder.returnStationId) {
          stationCalls.push(
            axiosInstance.get(`/Stations/${mergedOrder.returnStationId}`)
              .then((res) => ({ type: "return", data: res.data }))
              .catch(() => ({ type: "return", data: null }))
          );
        }

        if (stationCalls.length > 0) {
          const stationResults = await Promise.all(stationCalls);
          stationResults.forEach((result) => {
            if (result.type === "pickup" && result.data) {
              mergedOrder.pickupStationName = result.data.stationName || "(N/A)";
            } else if (result.type === "return" && result.data) {
              mergedOrder.returnStationName = result.data.stationName || "(N/A)";
            }
          });
        } else {
          mergedOrder.pickupStationName = "(N/A)";
          mergedOrder.returnStationName = "(N/A)";
        }

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

  const handlePrint = () => {
    window.print();
  };

  const renderContract = () => {
    if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;
    if (!order) return <div style={{ padding: 20 }}>No contract data available.</div>;

    const o = order;
    return (
      <div ref={contractRef} style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2>RENTAL AGREEMENT</h2>
          <p>Order ID: #{orderId}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Customer:</b> {o.renterName}</p>
          <p><b>Phone:</b> {o.renterPhone}</p>
          <p><b>Email:</b> {o.renterEmail}</p>
          <p><b>ID Number:</b> {o.renterIdNumber}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Vehicle Name:</b> {o.vehicleName}</p>
          <p><b>License Plate:</b> {o.vehicleLicensePlate}</p>
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
          <p><b>Pickup Station:</b> {o.pickupStationName}</p>
          <p><b>Return Station:</b> {o.returnStationName}</p>
          <p><b>Created At:</b> {o.createdAt ? dayjs(o.createdAt).format("DD/MM/YYYY HH:mm") : "(N/A)"}</p>
          <p><b>Status:</b> {o.status === "APPROVED" ? "Approved" : o.status}</p>
        </div>

        <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <p><b>Basic terms:</b></p>
          <ol style={{ marginLeft: 20 }}>
            <li>The renter agrees to pick up the vehicle at the specified time and location.</li>
            <li>Rental fees and payment terms are governed by the separate contract.</li>
            <li>The renter is responsible for any damage and accidents during the rental period.</li>
            <li>Any modifications must be agreed upon in writing by both parties.</li>
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
        </div>

        <div style={{ marginTop: 40, borderTop: "1px solid #ccc", paddingTop: 20 }}>
          <p><b>CONFIRMATION BY PARTIES:</b></p>
          <table style={{ width: "100%", marginTop: 20 }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", paddingRight: 20, textAlign: "center" }}>
                  <div>
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
      title={`Offline contract #${orderId}`}
        extra={
          <Space>
            <Button onClick={handlePrint}>
              🖨️ Print
            </Button>
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
    </>
  );
}