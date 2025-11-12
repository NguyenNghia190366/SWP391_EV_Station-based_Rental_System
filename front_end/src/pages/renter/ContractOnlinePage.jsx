import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Space, message, Spin, Modal, Tag } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import SignaturePad from "react-signature-canvas";

export default function ContractOnlinePage() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [signatureModal, setSignatureModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const sigPadRef = useRef(null);
  const contractRef = useRef();
  const axiosInstance = useAxiosInstance();

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

        const mergedOrder = {
          ...orderData,
          renterName: renter?.fullName || orderData.renterName || "(Không có)",
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

  const openSignature = () => setSignatureModal(true);
  const clearSignature = () => sigPadRef.current && sigPadRef.current.clear();

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
      </div>
    );
  };

  return (
    <>
      <Card
        title={`Hợp đồng #${orderId}`}
        extra={
          <Space>
            {!isSigned && (
              <Button type="primary" onClick={openSignature}>Ký điện tử</Button>
            )}
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
        title="Ký hợp đồng"
        open={signatureModal}
        onOk={handleSaveSignature}
        onCancel={() => setSignatureModal(false)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={isSigning}
        width={700}
      >
        <div style={{ border: '1px solid #ddd', height: 300 }}>
          <SignaturePad penColor="black" ref={sigPadRef} canvasProps={{width: 660, height: 300, className: 'sigCanvas'}} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={clearSignature}>Xóa</Button>
          <div style={{ color: '#888', fontSize: 12 }}>Ký bằng chữ ký tay của bạn, sau đó bấm Lưu.</div>
        </div>
      </Modal>
    </>
  );
}
