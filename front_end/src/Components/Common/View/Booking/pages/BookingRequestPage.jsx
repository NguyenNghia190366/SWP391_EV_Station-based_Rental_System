import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, DatePicker, Card, Spin, message, Select } from 'antd';
import { useVehicleAPI } from '@/hooks/useVehicles';
import { stationAPI } from '@/hooks/useStations';
import dayjs from 'dayjs';

const BookingRequestPage = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { getById, getModelById } = useVehicleAPI();
  const [form] = Form.useForm();
  const [vehicle, setVehicle] = useState(null);
  const [vehicleModel, setVehicleModel] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch vehicle details and stations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!vehicleId) {
          message.error('Không tìm thấy xe!');
          navigate('/Vehicles');
          return;
        }

        // Fetch vehicle, its model, and stations in parallel
        const vehicleData = await getById(vehicleId);
        
        // Get vehicle model to fetch price_per_hour and brand info
        let modelData = null;
        if (vehicleData.vehicleModelId) {
          modelData = await getModelById(vehicleData.vehicleModelId);
        }

        const stationsData = await stationAPI.getAll();
        
        setVehicle(vehicleData);
        setVehicleModel(modelData);
        setStations(stationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        message.error('Không thể tải thông tin xe');
        navigate('/Vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId, getById, getModelById, navigate]);

  const handleProceed = async (values) => {
    try {
      setSubmitting(true);

      // Validate dates
      const startDate = values.startDate?.toISOString();
      const endDate = values.endDate?.toISOString();
      const pickupStationId = values.pickupStation;

      if (!startDate || !endDate) {
        message.error('Vui lòng chọn ngày bắt đầu và kết thúc!');
        return;
      }

      if (!pickupStationId) {
        message.error('Vui lòng chọn trạm nhận xe!');
        return;
      }

      if (new Date(startDate) >= new Date(endDate)) {
        message.error('Ngày kết thúc phải sau ngày bắt đầu!');
        return;
      }

      // Save booking request to localStorage
      localStorage.setItem(
        'bookingRequest',
        JSON.stringify({
          vehicleId: vehicleId,
          startDate: startDate,
          endDate: endDate,
          pickupStationId: pickupStationId,
          vehicle: vehicle,
        })
      );

      message.success('Tiếp tục đặt xe...');
      // Navigate to full booking page
      navigate(`/booking/${vehicleId}`);
    } catch (error) {
      console.error('Error:', error);
      message.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="Đang tải thông tin xe..." />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800">Xe không tồn tại</h2>
          <Button type="primary" onClick={() => navigate('/Vehicles')} className="mt-4">
            Quay lại danh sách xe
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
            onClick={() => navigate('/Vehicles')}
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Yêu cầu đặt xe</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Vehicle Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-24">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🚗</span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {vehicleModel?.model || vehicle?.model || 'Xe điện'}
              </h2>
              <p className="text-lg text-blue-600 font-semibold mb-4">
                {(vehicleModel?.price_per_hour || 0).toLocaleString('vi-VN')} VNĐ/giờ
              </p>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div>
                  <span className="text-sm text-gray-600">Quãng đường đã đi:</span>
                  <p className="font-semibold text-gray-800">
                    {vehicle?.currentMileage || vehicleModel?.mileage || 0} km
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Hãng xe:</span>
                  <p className="font-semibold text-gray-800">
                    {vehicleModel?.brandName || 'N/A'}
                  </p>
                </div>
              </div>

              {vehicle.station && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">📍 Trạm</p>
                  <p className="font-semibold text-gray-800">
                    {vehicle.station.name || vehicle.station.station_name}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right: Booking Request Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Chọn ngày thuê xe</h3>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleProceed}
                requiredMark={false}
              >
                <Form.Item
                  label="Trạm nhận xe *"
                  name="pickupStation"
                  rules={[
                    { required: true, message: 'Vui lòng chọn trạm nhận xe!' },
                  ]}
                >
                  <Select
                    placeholder="Chọn trạm nhận xe"
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={stations.map(station => ({
                      label: station.name || station.station_name,
                      value: station.stationId || station.station_id || station.id,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Ngày bắt đầu *"
                  name="startDate"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày bắt đầu!' },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày bắt đầu"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf('day')
                    }
                    onChange={(date) => setStartDate(date)}
                    className="w-full"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Ngày kết thúc *"
                  name="endDate"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const start = getFieldValue('startDate');
                        if (!value || !start) {
                          return Promise.resolve();
                        }
                        if (value.isAfter(start)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('Ngày kết thúc phải sau ngày bắt đầu!')
                        );
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày kết thúc"
                    disabledDate={(current) => {
                      const start = startDate;
                      return (
                        current &&
                        (current < dayjs().startOf('day') ||
                          (start && current <= start))
                      );
                    }}
                    onChange={(date) => setEndDate(date)}
                    className="w-full"
                    size="large"
                  />
                </Form.Item>

                {/* Estimated cost */}
                <div className="my-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Ước tính chi phí</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                      <span className="text-gray-700">Giá thuê (mỗi giờ):</span>
                      <span className="font-semibold text-gray-800">
                        {(vehicleModel?.price_per_hour || 0).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                      <span className="text-gray-700">Số giờ thuê:</span>
                      <span className="font-semibold text-gray-800">
                        {(() => {
                          if (startDate && endDate) {
                            const hours = endDate.diff(startDate, 'hour');
                            return `${hours > 0 ? hours : 0} giờ`;
                          }
                          return '-- giờ';
                        })()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-gray-800">Tiền Thuê:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(() => {
                          if (startDate && endDate) {
                            const hours = endDate.diff(startDate, 'hour');
                            const rentCost = hours > 0 ? hours * (vehicleModel?.price_per_hour || 0) * 1: 0;
                            return rentCost.toLocaleString('vi-VN') + ' VNĐ';
                          }
                          return '-- VNĐ';
                        })()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-gray-800">Tiền cọc:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(() => {
                          if (startDate && endDate) {
                            const hours = endDate.diff(startDate, 'hour');
                            const depositCost = hours > 0 ? hours * (vehicleModel?.price_per_hour || 0) * 0.3 : 0;
                            return depositCost.toLocaleString('vi-VN') + ' VNĐ';
                          }
                          return '-- VNĐ';
                        })()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(() => {
                          if (startDate && endDate) {
                            const hours = endDate.diff(startDate, 'hour');
                            const totalCost = hours > 0 ? hours * (vehicleModel?.price_per_hour || 0) * 1.3 : 0;
                            return totalCost.toLocaleString('vi-VN') + ' VNĐ';
                          }
                          return '-- VNĐ';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <Button
                    block
                    size="large"
                    onClick={() => navigate('/Vehicles')}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    block
                    size="large"
                    htmlType="submit"
                    loading={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tiếp tục → Điền thông tin đặt xe
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestPage;
