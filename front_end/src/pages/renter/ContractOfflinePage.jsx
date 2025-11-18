import React, { useEffect, useState, useRef, useMemo } from "react";
import { Card, Button, Space, message, Spin } from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function ContractPage() {
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

  // Export DOC
  const handleExportDoc = () => {
    const content = contractRef.current?.innerText || `Rental contract #${orderId}`;
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract_${orderId}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    message.success("Contract downloaded (DOC)");
  };

  // Export TXT
  const handleExportTxt = () => {
    const content = contractRef.current?.innerText || `Rental contract #${orderId}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract_${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    message.success("Contract downloaded (TXT)");
  };

  // Print contract
  const handlePrint = () => {
    if (!contractRef.current) return window.print();
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return message.error("Cannot open print window. Please allow popups.");
    printWindow.document.write(`
      <html>
        <head>
          <title>Contract #${orderId}</title>
          <style>
            body { font-family: Inter, Arial, Helvetica, sans-serif; padding: 20px; }
            .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
          </style>
        </head>
        <body>${contractRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const renderContract = () => {
    if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;
    if (!order) return <div style={{ padding: 20 }}>No contract data available.</div>;

    const o = order;
    return (
      <div ref={contractRef} style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2>RENTAL CONTRACT</h2>
          <p>Order ID: #{orderId}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Customer:</b> {o.renterName}</p>
          <p><b>Phone:</b> {o.renterPhone}</p>
          <p><b>Email:</b> {o.renterEmail}</p>
          <p><b>ID Number:</b> {o.renterIdNumber}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Vehicle:</b> {o.vehicleName}</p>
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
              <li>Rental fees and payment terms are according to a separate contract.</li>
              <li>The renter is responsible for any damages or accidents during the rental period.</li>
            <li>Any modifications must be confirmed in writing by both parties.</li>
            <li>The vehicle must be returned on time; late returns will incur penalties.</li>
          </ol>
        </div>

        <div style={{ marginTop: 40 }}>
          <p><em>The owner and the renter agree to the terms above:</em></p>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", paddingRight: 20 }}>
                  <p>Owner:</p>
                  <p style={{ marginTop: 50, borderTop: "1px solid black" }}>Signature</p>
                </td>
                <td style={{ width: "50%", paddingLeft: 20 }}>
                  <p>Renter:</p>
                  <p style={{ marginTop: 50, borderTop: "1px solid black" }}>Signature</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={`Contract #${orderId}`}
      extra={
          <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportDoc} disabled={loading}>Download DOC</Button>
          <Button onClick={handleExportTxt} disabled={loading}>Download TXT</Button>
          <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint} disabled={loading}>Print / Export</Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin tip="Loading order details..." />
        </div>
      ) : (
        renderContract()
      )}
    </Card>
  );
}