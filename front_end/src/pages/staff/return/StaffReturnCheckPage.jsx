import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  InputNumber,
  Input,
  Button,
  message,
  Row,
  Col,
  Divider,
  Select,
  Table,
  Space,
  Checkbox,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useFeeTypes } from "@/hooks/useFeeTypes";
import dayjs from "dayjs";

export default function StaffReturnCheckPage() {
  const { orderId } = useParams();
  const axios = useAxiosInstance();
  const navigate = useNavigate();
  const { getAllFeeTypes } = useFeeTypes();

  const [form] = Form.useForm();
  const [order, setOrder] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [feeTypes, setFeeTypes] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  // Initialize late fee when feeTypes and order change
  useEffect(() => {
    if (feeTypes.length > 0 && order) {
      const lateFee = calculateLateFee();
      form.setFieldValue('lateFee', lateFee);
    }
  }, [feeTypes, order, form]);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch order data
      const orderRes = await axios.get(`/RentalOrders/${orderId}`);
      const orderData = orderRes.data;
      setOrder(orderData);

      // Fetch vehicle data
      if (orderData.vehicleId) {
        const vehicleRes = await axios.get(`/Vehicles/${orderData.vehicleId}`);
        const vehicleData = vehicleRes.data || {};
        // try to fetch vehicle model if not nested
        if (!vehicleData.vehicleModel && vehicleData.vehicleModelId) {
          try {
            const vmRes = await axios.get(`/VehicleModels/${vehicleData.vehicleModelId}`);
            vehicleData.vehicleModel = vmRes.data;
          } catch (err) {
            // ignore
          }
        }
        setVehicle(vehicleData);
      }

      // Fetch fee types
      const fees = await getAllFeeTypes();
      setFeeTypes(fees || []);
    } catch (err) {
      console.error("Load error:", err);
      message.error("Không thể tải thông tin đơn.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy giá trị xe để tính phí %
  const getVehicleValue = () => {
    const value = vehicle?.price || vehicle?.pricePerHour || vehicle?.price_per_hour || 0;
    console.log('Vehicle data:', vehicle);
    console.log('Vehicle value calculated:', value);
    return value;
  };

  // Lấy tổng giá trị đơn thuê (số giờ * giá/giờ)
  const getOrderTotalValue = () => {
    try {
      const pricePerHour =
        order?.pricePerHour ||
        order?.price_per_hour ||
        vehicle?.vehicleModel?.price_per_hour ||
        vehicle?.pricePerHour ||
        vehicle?.price_per_hour ||
        0;

      const start = order?.startTime ? dayjs(order.startTime) : null;
      const end = order?.endTime ? dayjs(order.endTime) : null;
      if (!start || !end) return 0;

      const hours = end.diff(start, "hour", true);
      const rentalPrice = (hours > 0 ? hours : 0) * pricePerHour;
      console.log('Order total rental value:', { hours, pricePerHour, rentalPrice });
      return rentalPrice;
    } catch (err) {
      console.error('Error calculating order total value', err);
      return 0;
    }
  };

  // Tính phí trễ hạn dựa trên thời gian
  const calculateLateFee = () => {
    if (!order?.endTime) return 0;

    const endTime = dayjs(order.endTime);
    const now = dayjs();
    const hoursLate = now.diff(endTime, "hours");

    if (hoursLate <= 0) return 0;

    // feeTypeId: 32 là "Phí trả xe trễ giờ"
    const lateFeType = feeTypes.find((f) => f.feeTypeId === 32);

    if (lateFeType?.amount) {
      const orderTotal = getOrderTotalValue();
      // amount là tỉ lệ (ví dụ 0.01 == 1%) áp lên tổng giá trị đơn thuê
      return hoursLate * (lateFeType.amount * orderTotal);
    }

    return 0;
  };

  // Thêm phí phát sinh - tính % dựa trên giá xe
  const addFee = (feeTypeId) => {
    if (!feeTypeId) return;

    const selectedFeeType = feeTypes.find((f) => f.feeTypeId === feeTypeId);
    if (!selectedFeeType) return;

    const orderTotal = getOrderTotalValue();
    const feeAmount = selectedFeeType.amount * orderTotal; // amount là %, convert to value

    const newFee = {
      id: Date.now(),
      feeTypeId,
      feeType1: selectedFeeType.feeType1 || selectedFeeType.feeType,
      amount: feeAmount,
      percentage: selectedFeeType.amount,
      description: "",
    };

    setSelectedFees([...selectedFees, newFee]);
  };

  // Xóa phí phát sinh
  const removeFee = (feeId) => {
    setSelectedFees(selectedFees.filter((f) => f.id !== feeId));
  };

  // Tính tổng phí
  const calculateTotalFee = () => {
    const trafficFee = form.getFieldValue("trafficFee") || 0;
    const lateFee = form.getFieldValue("lateFee") || 0;

    const selectedFeesTotal = selectedFees.reduce((sum, f) => sum + (f.amount || 0), 0);

    return trafficFee + lateFee + selectedFeesTotal;
  };

  const onFinish = (values) => {
    const totalFee = calculateTotalFee();
    const allFees = [
      ...selectedFees,
      {
        id: "traffic",
        type: "traffic",
        amount: values.trafficFee || 0,
      },
      {
        id: "late",
        type: "late",
        amount: values.lateFee || 0,
      },
    ];

    navigate(`/staff/return-summary/${orderId}`, {
      state: {
        orderId,
        order,
        vehicle,
        ...values,
        totalFee,
        allFees,
      },
    });
  };

  if (loading || !order) return <Card loading={loading} />;

  // vehicleValue was used previously; use getOrderTotalValue() for percent calculations

  const feeTableColumns = [
    {
      title: "Loại phí",
      dataIndex: "feeType1",
      key: "feeType1",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: "#999" }}>({(record.percentage * 100).toFixed(0)}% giá xe)</small>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) =>
        amount?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          onClick={() => removeFee(record.id)}
          size="small"
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title={`Xử lý trả xe - Đơn #${order.orderId || order.order_id}`}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card size="small" title="Thông tin đơn thuê">
              <p>
                <strong>Khách hàng:</strong> {order.renter?.fullName || order.renter?.renterName || "N/A"}
              </p>
              <p>
                <strong>Xe:</strong> {vehicle?.vehicleNumber || vehicle?.licensePlate || "N/A"}
              </p>
              <p>
                <strong>Mẫu:</strong> {vehicle?.vehicleModel?.modelName || "N/A"}
              </p>
              <p>
                <strong>Thời gian bắt đầu:</strong>{" "}
                {dayjs(order.startTime).format("DD/MM/YYYY HH:mm") || "N/A"}
              </p>
              <p>
                <strong>Thời gian kết thúc:</strong>{" "}
                {dayjs(order.endTime).format("DD/MM/YYYY HH:mm") || "N/A"}
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card size="small" title="Thông tin giá trị xe">
              <p>
                <strong>Tổng giá trị đơn thuê (dùng để tính %):</strong>{" "}
                {getOrderTotalValue().toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </p>
              <p>
                <strong>Mô tả:</strong> {order.description || "Không có"}
              </p>
              <p>
                <strong>Trạng thái:</strong> {order.status || "N/A"}
              </p>
            </Card>
          </Col>
        </Row>

        <Divider>TÍNH PHÍ PHÁT SINH</Divider>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Phí vi phạm giao thông (VNĐ)" name="trafficFee">
                <InputNumber min={0} className="w-full" placeholder="Nhập số tiền" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Phí trễ hạn (VNĐ)" name="lateFee" initialValue={0}>
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>THÊM PHÍ PHÁT SINH KHÁC</Divider>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={18}>
              <Select
                placeholder="Chọn loại phí tổn hại"
                allowClear
                style={{ width: '10 %' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ minWidth: 420, whiteSpace: 'nowrap' }}
                options={feeTypes
                  .filter(
                    (f) =>
                      f.feeTypeId >= 1 && f.feeTypeId <= 31 && // Các phí tổn hại
                      !selectedFees.find((sf) => sf.feeTypeId === f.feeTypeId)
                  )
                  .map((f) => {
                    const approx = (f.amount * getOrderTotalValue()) || 0;
                    return {
                      value: f.feeTypeId,
                      label: `${f.feeType1} (${(f.amount * 100).toFixed(0)}% = ${approx.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })})`,
                    };
                  })}
                onSelect={addFee}
              />
            </Col>
          </Row>

          {selectedFees.length > 0 && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Table
                dataSource={selectedFees}
                columns={feeTableColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>
          )}

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú về tình trạng xe hoặc lý do phí phát sinh"
            />
          </Form.Item>

          <Card
            style={{
              background: "#f5f5f5",
              marginBottom: 16,
              textAlign: "right",
            }}
          >
            <h3>
              Tổng phí phát sinh:{" "}
              <span style={{ color: "#ff4d4f", fontSize: "1.2em" }}>
                {calculateTotalFee().toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </h3>
          </Card>

          <Space style={{ width: "100%" }}>
            <Button block onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button type="primary" htmlType="submit" block>
              Tiếp tục
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
   