import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Spin, Empty, Button, message, Space, Popconfirm, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useRenters } from "@/hooks/useRenters";
import { useRentalOrders } from "@/hooks/useRentalOrders";
import { DeleteOutlined } from "@ant-design/icons";

export default function RentalHistoryPage() {
  const instance = useAxiosInstance();
  const navigate = useNavigate();
  const { getRenterIdByUserId, rejectRentalOrder } = useRenters();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [paidOrderIds, setPaidOrderIds] = useState(new Set());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.warning("Không tìm thấy userId!");
        return;
      }

      // Lấy renterId từ userId
      const renterId = await getRenterIdByUserId(userId);
      
      // Fetch tất cả dữ liệu cần thiết (including vehicle models to compose names)
      const [rentalOrdersRes, vehiclesRes, stationsRes, vehicleModelsRes] = await Promise.all([
        instance.get(`/RentalOrders?renter_id=${renterId}`),
        instance.get("/Vehicles"),
        instance.get("/Stations"),
        instance.get("/VehicleModels"),
      ]);

      const rentalOrders = Array.isArray(rentalOrdersRes.data) 
        ? rentalOrdersRes.data 
        : rentalOrdersRes.data?.data || [];
      
      const vehicles = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data?.data || [];

      const vehicleModels = Array.isArray(vehicleModelsRes.data)
        ? vehicleModelsRes.data
        : vehicleModelsRes.data?.data || [];
      
      const stations = Array.isArray(stationsRes.data) 
        ? stationsRes.data 
        : stationsRes.data?.data || [];

      // Build a map of modelId -> brandName (normalize keys)
      const modelMap = {};
      vehicleModels.forEach((m) => {
        const mid = m.id ?? m.vehicleModelId ?? m.vehicle_model_id;
        if (mid != null) modelMap[mid] = m.brandName ?? m.brand_name ?? m.brand ?? "";
      });

      // Normalize vehicles into a map by id and compose a name using brand + model when possible
      const vehiclesMap = {};
      vehicles.forEach((v) => {
        const vid = v.vehicleId ?? v.id ?? v.vehicle_id;
        const vmid = v.vehicleModelId ?? v.vehicle_model_id ?? v.modelId ?? v.model_id;
        const brandName = modelMap[vmid] || v.brandName || v.brand || "";
        const modelText = v.model ?? v.model_text ?? "";
        const composed = `${brandName} ${modelText}`.trim();
        const name = v.vehicleName || composed || v.licensePlate || (vid != null ? `#${vid}` : "");
        if (vid != null) vehiclesMap[vid] = { ...v, vehicleName: name };
      });

      // Merge dữ liệu - thêm tên xe và trạm (use normalized keys and maps)
      const merged = rentalOrders.map((order) => {
        const orderVehicleId = order.vehicleId ?? order.vehicle_id ?? order.vehicle;
        const pickupId = order.pickupStationId ?? order.pickup_station_id ?? order.pickupStation;
        const returnId = order.returnStationId ?? order.return_station_id ?? order.returnStation;
        const vehicleObj = vehiclesMap[orderVehicleId] || {};
        const pickupStation = stations.find((s) => (s.stationId ?? s.id ?? s.station_id) === pickupId) || {};
        const returnStation = stations.find((s) => (s.stationId ?? s.id ?? s.station_id) === returnId) || {};

        return {
          ...order,
          vehicleId: orderVehicleId,
          vehicleName: vehicleObj.vehicleName || (orderVehicleId ? `#${orderVehicleId}` : ""),
          pickupStationName: pickupStation.stationName || pickupStation.name || pickupStation.station_name || `#${pickupId}`,
          returnStationName: returnStation.stationName || returnStation.name || returnStation.station_name || `#${returnId}`,
        };
      });

      setOrders(merged);
    } catch (err) {
      console.error("❌ Lỗi tải lịch sử thuê:", err);
      message.error("Không thể tải lịch sử thuê!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment status for all orders
  const fetchPaymentStatuses = async (orderIds) => {
    try {
      const paid = new Set();
      for (const orderId of orderIds) {
        const payRes = await instance.get(`/Payments?order_id=${orderId}`);
        const payData = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
        const hasPaid = payData.some(p => {
          const t = (p.type_payment || p.typePayment || '').toString().toUpperCase();
          const s = (p.payment_status || p.paymentStatus || p.PaymentStatus || '').toString().toUpperCase();
          return (t === 'PAY' || t === 'PAY') && s === 'PAID';
        });
        if (hasPaid) paid.add(orderId);
      }
      setPaidOrderIds(paid);
    } catch (err) {
      console.error("Error fetching payment statuses:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch payment statuses when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.orderId);
      fetchPaymentStatuses(orderIds);
    }
  }, [orders]);


  // Check if order is paid (has PAID payment record)
  const isOrderPaid = async (orderId) => {
    try {
      const payRes = await instance.get(`/Payments?order_id=${orderId}`);
      const payData = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
      return payData.some(p => {
        const t = (p.type_payment || p.typePayment || '').toString().toUpperCase();
        const s = (p.payment_status || p.paymentStatus || p.PaymentStatus || '').toString().toUpperCase();
        return (t === 'PAY' || t === 'PAY') && s === 'PAID';
      });
    } catch (err) {
      return false;
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
      width: 80,
    },
    {
      title: "Xe",
      dataIndex: "vehicleName",
      key: "vehicleName",
      width: 160,
      render: (name, record) => (
        <div>
          {/* primary: vehicle name when available, otherwise show id */}
          <div className="font-semibold">{name && name !== `#${record.vehicleId}` ? name : `#${record.vehicleId}`}</div>
          {/* secondary: show id when name is present to keep the id visible */}
          {name && name !== `#${record.vehicleId}` ? (
            <div style={{ fontSize: 12, color: '#6b7280' }}>{`#${record.vehicleId}`}</div>
          ) : null}
        </div>
      ),
    },
    {
      title: "Trạm (nhận → trả)",
      key: "stations",
      render: (_, record) => (
        <span>
          {record.pickupStationName} → {record.returnStationName}
        </span>
      ),
      width: 240,
    },
    {
      title: "Thời gian thuê",
      key: "rentalTime",
      render: (_, record) => (
        <span>
          {dayjs(record.startTime).format("DD/MM/YYYY HH:mm")} → {dayjs(record.endTime).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      width: 240,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          BOOKED: { color: "blue", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          CANCELED: { color: "red", text: "Từ chối" },
          IN_USE: { color: "orange", text: "Đang sử dụng" },
          COMPLETED: { color: "cyan", text: "Hoàn tất" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      width: 120,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
    {
      title: "Ghi chú",
      key: "notes",
      render: (_, record) => {
        // Show approval message when status is APPROVED
        if (record.status === "APPROVED") {
          const pickupStationName = record.pickupStationName || "trạm";
          const startDate = record.startTime ? dayjs(record.startTime).format("DD/MM/YYYY") : "";
          return (
            <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 500, lineHeight: "1.4" }}>
              ✅ Staff đã duyệt.<br />
              Đến <strong>{pickupStationName}</strong> ngày <strong>{startDate}</strong> ký hợp đồng.
            </div>
          );
        }
        return null;
      },
      width: 220,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const showCancel = record.status === "BOOKED" || record.status === "APPROVED";
        const showContract = record.status === "APPROVED" || record.status === "CONTRACT_SENT";
        const disabled = record.status === "APPROVED";
        const isPaid = paidOrderIds.has(record.orderId);
        
        return (
          <Space>
            {showContract && !isPaid && (
              <Button
                type="primary"
                ghost
                size="small"
                onClick={() => navigate(`/renter/contract-online/${record.orderId}`)}
              >
                Hợp đồng
              </Button>
            )}
            
            {showCancel && (
              <Popconfirm
                title={disabled ? "Đơn đã được duyệt, không thể hủy." : "Xác nhận hủy đơn?"}
                onConfirm={async () => {
                  if (disabled) return message.warning("Đơn đã được duyệt, không thể hủy từ phía renter.");
                  if (cancellingId) return;
                  setCancellingId(record.orderId);
                  try {
                    // Use rejectRentalOrder from useRenters (same as staff)
                    // This calls /Reject endpoint which updates status to CANCELED
                    await rejectRentalOrder(record.orderId);
                    message.success("Đã hủy đơn thuê!");
                    setTimeout(() => fetchOrders(), 400);
                  } catch (err) {
                    console.error("❌ Lỗi hủy đơn:", err);
                    message.error("Hủy đơn thất bại. Vui lòng thử lại.");
                  } finally {
                    setCancellingId(null);
                  }
                }}
                okText="Có"
                cancelText="Không"
                disabled={disabled}
              >
                <Tooltip title={disabled ? "Đã duyệt — không thể hủy" : "Hủy đơn"}>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={cancellingId === record.orderId}
                    disabled={disabled || cancellingId === record.orderId}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
      width: 150,
    },
  ];

  return (
    <Card className="shadow-md rounded-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📜 Lịch sử đặt xe</h2>
        <p className="text-gray-500">Xem tất cả các đơn thuê xe của bạn</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : orders.length === 0 ? (
        <Empty
          description="Chưa có lịch sử đặt xe"
          style={{ marginTop: "50px", marginBottom: "50px" }}
        >
          <Button type="primary" onClick={() => navigate("/vehicles")}>
            Thuê xe ngay
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} đơn`,
          }}
          scroll={{ x: 900 }}
          className="shadow-md rounded-lg"
        />
      )}
    </Card>
  );
}
