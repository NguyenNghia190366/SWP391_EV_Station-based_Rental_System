import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Tag, Breadcrumb, Row, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";
import { useVehicleAPI } from "@/hooks/useVehicles";

export default function VehicleDetailsPage() {
  const { vehicleId } = useParams();
  const api = useAxiosInstance();
  const navigate = useNavigate();
  const { getModelById } = useVehicleAPI();

  const [vehicle, setVehicle] = useState(null);
  const [model, setModel] = useState(null);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricePerHour, setPricePerHour] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vehicle
        const vehicleRes = await api.get(`/Vehicles/${vehicleId}`);
        const vData = vehicleRes.data;
        setVehicle(vData);

        // Fetch model
        if (vData.vehicleModelId) {
          try {
            const modelRes = await getModelById(vData.vehicleModelId);
            setModel(modelRes);
            setPricePerHour(modelRes.price_per_hour || 0);
          } catch (err) {
            console.error("Failed to fetch model:", err);
          }
        }

        // Fetch station
        if (vData.stationId) {
          try {
            const stationRes = await api.get(`/Stations/${vData.stationId}`);
            setStation(stationRes.data);
          } catch (err) {
            console.error("Failed to fetch station:", err);
          }
        }
      } catch (err) {
        console.error("Error loading vehicle details:", err);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vehicleId, api, getModelById]);

  if (loading) return <Spin tip="Loading vehicle details..." style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }} />;
  if (!vehicle) return <Card>Vehicle not found.</Card>;

  const isAvailable = vehicle.isAvailable === true;
  const modelName = model ? `${model.brandName || ''} ${model.model || ''}`.trim() : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { title: <a onClick={() => navigate('/vehicles')}>Vehicles</a> },
          { title: modelName },
          { title: vehicle.licensePlate }
        ]} style={{ marginBottom: 24 }} />

        {/* Main Card */}
        <Card style={{ borderRadius: 12 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
              {modelName}
            </h1>
            <Tag color={isAvailable ? 'green' : 'red'} style={{ fontSize: 14, padding: '6px 12px' }}>
              {isAvailable ? '✓ Available' : '✗ Unavailable'}
            </Tag>
          </div>

          {/* Image Section */}
          <div style={{ marginBottom: 32 }}>
            <img
              alt={vehicle.licensePlate}
              onError={(e) => { e.target.src = '/placeholder-vehicle.jpg'; }}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 12,
              }}
            />
          </div>

          {/* Details Grid */}
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🚗</div>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>License Plate</p>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{vehicle.licensePlate}</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Release Year</p>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{vehicle.releaseYear || 'N/A'}</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔋</div>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Battery Capacity</p>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{vehicle.batteryCapacity || 'N/A'} kWh</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⚙️</div>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Mileage</p>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{vehicle.currentMileage || 0} km</p>
              </div>
            </Col>
          </Row>

          {/* Details Section */}
          <div style={{ background: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Vehicle Information</h3>
            <Row gutter={[24, 12]}>
              <Col xs={24} sm={12}>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Model</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{model?.model || vehicle?.model || 'N/A'}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Brand</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{model?.brandName || 'N/A'}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Condition</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{vehicle.condition || 'Good'}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Seats</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{model?.seats || vehicle?.seats || 'N/A'}</p>
              </Col>
              {station && (
                <Col xs={24}>
                  <p style={{ margin: 0, color: '#666', fontSize: 12 }}>📍 Current Station</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{station.stationName || station.name || 'N/A'}</p>
                </Col>
              )}
            </Row>
          </div>

          {/* Price Section */}
          <div style={{ background: '#e6f7ff', padding: 20, borderRadius: 8, marginBottom: 32 }}>
            <p style={{ margin: 0, color: '#0050b3', fontSize: 12 }}>Rental Price</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0050b3' }}>
              {pricePerHour > 0 ? `${(pricePerHour / 1000).toLocaleString('vi-VN')}.000` : 'Updating'} <span style={{ fontSize: 16 }}>/hr</span>
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            {isAvailable && (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(`/booking/${vehicleId}`)}
              >
                Book This Vehicle
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
