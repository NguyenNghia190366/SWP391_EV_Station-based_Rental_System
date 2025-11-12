import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Space, message, Spin, Tag } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function ContractOfflinePage() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isContractSent, setIsContractSent] = useState(false);
  const contractRef = useRef();
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();

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
          : vehicle?.vehicleName || orderData?.vehicleName || "(Không có)";

        // Merge data
        const mergedOrder = {
          ...orderData,
          renterName: userInfo?.fullName || renter?.fullName || "(Không có)",
          renterPhone: userInfo?.phoneNumber || renter?.phoneNumber || "(Không có)",
          renterEmail: userInfo?.email || renter?.email || "(Không có)",
          renterIdNumber: cccd?.id_Card_Number || renter?.cccd || "(Không có)",
          vehicleName: composedVehicleName,
          vehicleLicensePlate: vehicle?.licensePlate || "(Không có)",
          vehicleColor: vehicle?.vehicleColor || "(Không có)",
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
              mergedOrder.pickupStationName = result.data.stationName || "(Không có)";
            } else if (result.type === "return" && result.data) {
              mergedOrder.returnStationName = result.data.stationName || "(Không có)";
            }
          });
        } else {
          mergedOrder.pickupStationName = "(Không có)";
          mergedOrder.returnStationName = "(Không có)";
        }

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

  const handleSendToRenter = async () => {
    setIsSending(true);
    try {
      // Update order status to notify renter
      await axiosInstance.put(`/RentalOrders/${orderId}`, {
        status: "CONTRACT_SENT"
      });
      setIsContractSent(true);
      message.success("Hợp đồng đã được gửi cho khách hàng!");
    } catch (err) {
      console.error("Error sending contract:", err);
      message.error("Không thể gửi hợp đồng. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
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
          <p><b>Trạng thái:</b> {o.status === "APPROVED" ? "Đã duyệt" : o.status}</p>
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

        {isContractSent && (
          <div style={{ marginTop: 40, borderTop: "1px solid #ccc", paddingTop: 20 }}>
            <p><b>Trạng thái hợp đồng:</b></p>
            <div style={{ 
              padding: 20, 
              border: "2px dashed #52c41a", 
              borderRadius: 8,
              backgroundColor: "#f6ffed",
              marginTop: 10
            }}>
              <p style={{ fontSize: 14, color: "#52c41a" }}>✓ Hợp đồng đã được gửi cho khách hàng</p>
              <p style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
                Thời gian gửi: {dayjs().format("DD/MM/YYYY HH:mm:ss")}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card
        title={`Hợp đồng trực tuyến #${orderId}`}
        extra={
          <Space>
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
    </>
  );
}