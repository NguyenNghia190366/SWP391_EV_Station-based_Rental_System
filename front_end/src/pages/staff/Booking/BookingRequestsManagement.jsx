import React, { useEffect, useState, useMemo } from "react";
import { Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BookingTable from "./components/BookingTable";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

export default function BookingRequestsManagement() {
  const api = useAxiosInstance();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ✅ Fetch all APIs in parallel (not sequential)
      const [ordersRes, rentersRes, vehiclesRes, stationsRes] = await Promise.all([
        api.get("/RentalOrders").catch(() => ({ data: [] })),
        api.get("/Renters").catch(() => ({ data: [] })),
        api.get("/Vehicles").catch(() => ({ data: [] })),
        api.get("/Stations").catch(() => ({ data: [] })),
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const renters = Array.isArray(rentersRes.data) ? rentersRes.data : [];
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      const stations = Array.isArray(stationsRes.data) ? stationsRes.data : [];

      // ✅ Create lookup maps (O(1) instead of O(n) for each find)
      const renterMap = new Map(renters.map(r => [r.renterId, r]));
      const vehicleMap = new Map(vehicles.map(v => [v.vehicleId, v]));
      const stationMap = new Map(stations.map(s => [s.stationId, s]));

      // ✅ Merge data using maps
      const merged = orders.map((order) => {
        const renter = renterMap.get(order.renterId);
        const vehicle = vehicleMap.get(order.vehicleId);
        const pickupStation = stationMap.get(order.pickupStationId);
        const returnStation = stationMap.get(order.returnStationId);

        return {
          ...order,
          renterName: renter?.fullName || `#${order.renterId}`,
          vehicleName: vehicle?.vehicleName || `#${order.vehicleId}`,
          pickupStationName: pickupStation?.stationName || `#${order.pickupStationId}`,
          returnStationName: returnStation?.stationName || `#${order.returnStationId}`,
        };
      });

      setBookings(merged);
    } catch (err) {
      console.error("❌ Error loading orders:", err);
      message.error("Cannot load rental orders list!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Booking Requests Management
          </h2>
          <p className="text-gray-500 text-sm">
            View and process booking requests from customers
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchData}
          className="bg-green-500 hover:bg-green-600"
        >
          Refresh
        </Button>
      </div>

      <BookingTable bookings={bookings} loading={loading} onRefresh={fetchData} />
    </div>
  );
}