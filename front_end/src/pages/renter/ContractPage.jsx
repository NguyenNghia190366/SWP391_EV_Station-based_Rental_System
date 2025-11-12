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

  // Xuất DOC
  const handleExportDoc = () => {
    const content = contractRef.current?.innerText || `Hợp đồng thuê xe #${orderId}`;
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract_${orderId}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    message.success("Đã tải hợp đồng (DOC)");
  };

  // Xuất TXT
  const handleExportTxt = () => {
    const content = contractRef.current?.innerText || `Hợp đồng thuê xe #${orderId}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract_${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    message.success("Đã tải hợp đồng (TXT)");
  };

  // In hợp đồng
  const handlePrint = () => {
    if (!contractRef.current) return window.print();
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return message.error("Không thể mở cửa sổ in. Vui lòng cho phép popup.");
    printWindow.document.write(`
      <html>
        <head>
          <title>Hợp đồng #${orderId}</title>
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
    if (!order) return <div style={{ padding: 20 }}>Không có dữ liệu hợp đồng.</div>;

    const o = order;
    return (
      <div ref={contractRef} style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2>HỢP ĐỒNG THUÊ XE</h2>
          <p>Mã đơn: #{orderId}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Khách hàng:</b> {o.renterName}</p>
          <p><b>Số điện thoại:</b> {o.renterPhone}</p>
          <p><b>Email:</b> {o.renterEmail}</p>
          <p><b>CMND/CCCD:</b> {o.renterIdNumber}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p><b>Xe:</b> {o.vehicleName}</p>
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

        <div style={{ marginTop: 40 }}>
          <p><em>Bên cho thuê và bên thuê đồng ý với các điều khoản trên:</em></p>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", paddingRight: 20 }}>
                  <p>Bên cho thuê:</p>
                  <p style={{ marginTop: 50, borderTop: "1px solid black" }}>Ký tên</p>
                </td>
                <td style={{ width: "50%", paddingLeft: 20 }}>
                  <p>Bên thuê:</p>
                  <p style={{ marginTop: 50, borderTop: "1px solid black" }}>Ký tên</p>
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
      title={`Hợp đồng #${orderId}`}
      extra={
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportDoc} disabled={loading}>Tải DOC</Button>
          <Button onClick={handleExportTxt} disabled={loading}>Tải TXT</Button>
          <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint} disabled={loading}>In / Xuất</Button>
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
  );
}