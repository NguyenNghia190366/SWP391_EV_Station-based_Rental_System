import React, { useEffect, useState } from "react";
import axios from "axios";
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
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [paidOrderIds, setPaidOrderIds] = useState(new Set());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.warning("User ID not found!");
        return;
      }
      // Lấy tên khách hàng từ API Users
      try {
        const userRes = await axios.get(`/Users/${userId}`);
        setCustomerName(userRes.data?.fullName || userRes.data?.name || "");
      } catch {
        setCustomerName("");
      }

      // Get renterId from userId
      const renterId = await getRenterIdByUserId(userId);
      
      // Fetch all necessary data (including vehicle models to compose names)
      const [rentalOrdersRes, vehiclesRes, stationsRes, vehicleModelsRes] = await Promise.all([
        instance.get(`/RentalOrders?renter_id=${renterId}`),
        instance.get("/Vehicles"),
        instance.get("/Stations"),
        instance.get("/VehicleModels"),
      ]);

      const rentalOrdersRaw = Array.isArray(rentalOrdersRes.data)
        ? rentalOrdersRes.data
        : rentalOrdersRes.data?.data || [];

      // Ensure frontend-only filtering by renterId so a user can't see others' orders
      const rentalOrders = rentalOrdersRaw.filter((o) => {
        const ownerId = o.renterId ?? o.renter_id ?? o.RenterId ?? o.Renter_Id ?? o.renter;
        return String(ownerId) === String(renterId);
      });
      
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

      // Merge data - add vehicle and station names (use normalized keys and maps)
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
      console.error("❌ Error loading rental history:", err);
      message.error("Cannot load rental history!");
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
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: () => customerName || "N/A",
      width: 180,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <span className="font-semibold text-blue-600">#{id}</span>,
      width: 80,
    },
    {
      title: "Vehicle",
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
      title: "Station (pickup → return)",
      key: "stations",
      render: (_, record) => (
        <span>
          {record.pickupStationName} → {record.returnStationName}
        </span>
      ),
      width: 240,
    },
    {
      title: "Rental time",
      key: "rentalTime",
      render: (_, record) => (
        <span>
          {dayjs(record.startTime).format("DD/MM/YYYY HH:mm")} → {dayjs(record.endTime).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      width: 240,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
          const statusMap = {
          BOOKED: { color: "blue", text: "Pending" },
          APPROVED: { color: "green", text: "Approved" },
          CANCELED: { color: "red", text: "Canceled" },
          IN_USE: { color: "orange", text: "In Use" },
          COMPLETED: { color: "cyan", text: "Completed" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      width: 120,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 160,
    },
    {
      title: "Notes",
      key: "notes",
      render: (_, record) => {
        // Show approval message when status is APPROVED
        if (record.status === "APPROVED") {
          const pickupStationName = record.pickupStationName || "station";
          const startDate = record.startTime ? dayjs(record.startTime).format("DD/MM/YYYY") : "";
          return (
            <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 500, lineHeight: "1.4" }}>
              ✅ Staff approved.<br />
              Please go to <strong>{pickupStationName}</strong> on <strong>{startDate}</strong> to sign the contract.
            </div>
          );
        }
        return null;
      },
      width: 220,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const showCancel = record.status === "BOOKED" || record.status === "APPROVED";
        const showContract = record.status === "APPROVED";
        const disabled = record.status === "APPROVED";
        const isPaid = paidOrderIds.has(record.orderId);
        
        return (
          <Space>
            {showContract && (
              <Button
                type="primary"
                ghost
                size="small"
                onClick={() => navigate(`/renter/contract-online/${record.orderId}`)}
              >
                Contract
              </Button>
            )}
            
            {showCancel && (
              <Popconfirm
                title={disabled ? "Order approved, cannot cancel." : "Confirm cancellation?"}
                onConfirm={async () => {
                  if (disabled) return message.warning("Order approved, cannot cancel from renter side.");
                  if (cancellingId) return;
                  setCancellingId(record.orderId);
                  try {
                    // Use rejectRentalOrder from useRenters (same as staff)
                    // This calls /Reject endpoint which updates status to CANCELED
                    await rejectRentalOrder(record.orderId);
                    message.success("Order canceled!");
                    setTimeout(() => fetchOrders(), 400);
                  } catch (err) {
                    console.error("❌ Error cancelling order:", err);
                    message.error("Order cancellation failed. Please try again.");
                  } finally {
                    setCancellingId(null);
                  }
                }}
                okText="Yes"
                cancelText="No"
                disabled={disabled}
              >
                <Tooltip title={disabled ? "Approved — cannot cancel" : "Cancel order"}>
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📜 Booking History</h2>
        <p className="text-gray-500">View all your rental orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" tip="Loading data..." />
        </div>
      ) : orders.length === 0 ? (
        <Empty
          description="No booking history"
          style={{ marginTop: "50px", marginBottom: "50px" }}
        >
            <Button type="primary" onClick={() => navigate("/vehicles")}>
            Book a vehicle
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
            pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} orders`,
          }}
          scroll={{ x: 900 }}
          className="shadow-md rounded-lg"
        />
      )}
    </Card>
  );
}
