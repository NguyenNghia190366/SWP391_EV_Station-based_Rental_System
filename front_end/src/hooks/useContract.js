// hooks/useContract.js
import { useEffect, useState, useCallback, use } from "react";
import { message, Modal } from "antd";
import { useAxiosInstance } from "@/hooks/useAxiosInstance";

// Helper
export const extractArrayData = (res) =>
  Array.isArray(res.data) ? res.data : res.data?.data || [];

export const createMap = (array, keyField, transform = (x) => x) => {
  return array.reduce((acc, item) => {
    const key = item[keyField] || item.id;
    if (key) acc[key] = transform(item);
    return acc;
  }, {});
};

export const getVehicleName = (vehicle, models) => {
  const vmid = vehicle.vehicleModelId || vehicle.vehicle_model_id;

  const model = models.find(
    (m) => (m.id || m.vehicleModelId || m.vehicle_model_id) === vmid
  );

  const brand = model?.brandName || "";
  const modelName = vehicle.model || "";

  return {
    ...vehicle,
    vehicleName:
      `${brand} ${modelName}`.trim() || vehicle.licensePlate || "N/A",
  };
};

// ===============================
// Load Staff ID
// ===============================
export const useStaffId = (axios) => {
  const [staffId, setStaffId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = Number(localStorage.getItem("userId"));
        const res = await axios.get("/Staffs");
        const staffs = extractArrayData(res);

        const found = staffs.find(
          (s) => Number(s.userId || s.user_id) === userId
        );

        setStaffId(
          found?.staffId ||
            found?.id ||
            found?.staff_id ||
            staffs[0]?.staffId ||
            null
        );
      } catch {
        setStaffId(null);
      }
    };

    load();
  }, [axios]);

  return staffId;
};

// ===============================
// Confirm Action Utility
// ===============================
export const confirmAction = (options, onConfirmAction) => {
  return new Promise((resolve) => {
    Modal.confirm({
      ...options,
      onOk: async () => {
        const success = await onConfirmAction();
        resolve(success);
      },
      onCancel: () => resolve(false),
    });
  });
};

// ===============================
// Fetch Handover Orders
// ===============================
export const fetchHandoverOrdersFn = async (axios) => {
  try {
    const [ordersRes, vehiclesRes, rentersRes, stationsRes, modelsRes] =
      await Promise.all([
        axios.get("/RentalOrders"),
        axios.get("/Vehicles"),
        axios.get("/Renters"),
        axios.get("/Stations"),
        axios.get("/VehicleModels"),
      ]);

    const orders = extractArrayData(ordersRes);
    const vehicles = extractArrayData(vehiclesRes);
    const renters = extractArrayData(rentersRes);
    const stations = extractArrayData(stationsRes);
    const models = extractArrayData(modelsRes);

    const vehicleMap = createMap(vehicles, "vehicleId", (v) =>
      getVehicleName(v, models)
    );
    const renterMap = createMap(renters, "renterId");
    const stationMap = createMap(stations, "stationId");

    return orders
      .filter((o) => o.status === "PENDING_HANDOVER" || o.status === "APPROVED")
      .map((o) => ({
        ...o,
        vehicleName: vehicleMap[o.vehicleId]?.vehicleName || "N/A",
        vehicleLicensePlate: vehicleMap[o.vehicleId]?.licensePlate || "N/A",
        renterName:
          renterMap[o.renterId]?.fullName ||
          renterMap[o.renterId]?.renterName ||
          "N/A",
        renterPhone:
          renterMap[o.renterId]?.phoneNumber ||
          renterMap[o.renterId]?.phone ||
          "N/A",
        pickupStationName:
          stationMap[o.pickupStationId]?.stationName ||
          stationMap[o.pickupStationId]?.name ||
          "N/A",
        returnStationName:
          stationMap[o.returnStationId]?.stationName ||
          stationMap[o.returnStationId]?.name ||
          "N/A",
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error(err);
    message.error("Không thể tải yêu cầu nhận xe.");
    return [];
  }
};

// ===============================
// Approve Handover
// ===============================
export const approveHandoverFn = (axios, orderId) =>
  confirmAction(
    {
      title: "Phê duyệt nhận xe",
      content: "Xác nhận khách hàng đã nhận xe?",
      okText: "Phê duyệt",
    },

    async () => {
      const instance = useAxiosInstance(true);

      try {
        await instance.put(`/api/Inuse?id=${orderId}`);
        message.success("Đã phê duyệt yêu cầu.");
        return true;
      } catch {
        message.error("Không thể phê duyệt.");
        return false;
      }
    }
  );

// ===============================
// Deliver Vehicle + Create Contract
// ===============================
export const deliverVehicleFn = (axios, staffId, orderId) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title: "Giao xe",
      content: "Xác nhận đã giao xe & tạo hợp đồng?",
      okText: "Giao xe",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Step 1: Get order to find vehicleId
          const orderRes = await axios.get(`/RentalOrders/${orderId}`);
          const vehicleId = orderRes.data?.vehicleId;

          // Step 2: Create contract
          await axios.post("/Contracts", {
            StaffId: staffId ?? 0,
            OrderId: orderId,
            SignedDate: new Date().toISOString(),
          });

          // Step 3: Update vehicle - increment "đang cho thuê" count
          if (vehicleId) {
            try {
              const vehicleRes = await axios.get(`/Vehicles/${vehicleId}`);
              const vehicle = vehicleRes.data;
              const currentRenting = vehicle.numberVehicleRenting || 0;

              // Increment đang cho thuê by 1
              await axios.put(`/Vehicles/${vehicleId}`, {
                numberVehicleRenting: currentRenting + 1,
              });
            } catch (err) {
              console.warn(
                "Could not update vehicle rental count (non-fatal):",
                err
              );
            }
          }

          // Step 4: Update order status to IN_USE
          await axios.put(`/api/RentalOrders/${orderId}`, {
            status: "IN_USE",
            handoverDeliveredAt: new Date().toISOString(),
          });

          message.success(
            "Đã giao xe và tạo hợp đồng. Cập nhật số xe đang cho thuê."
          );
          resolve(true);
        } catch (err) {
          console.error("Deliver vehicle error:", err);
          message.error("Không thể giao xe.");
          resolve(false);
        }
      },
      onCancel: () => resolve(false),
    });
  });
};

// ===============================
// Reject Handover
// ===============================
export const rejectHandoverFn = (axios, orderId) =>
  confirmAction(
    {
      title: "Từ chối nhận xe",
      content: "Đơn sẽ quay về trạng thái ĐÃ DUYỆT",
      okText: "Từ chối",
      okButtonProps: { danger: true },
    },
    async () => {
      try {
        await axios.put(`/RentalOrders/${orderId}`, {
          status: "APPROVED",
        });
        message.success("Đã từ chối yêu cầu.");
        return true;
      } catch {
        message.error("Không thể từ chối.");
        return false;
      }
    }
  );

// ===============================
// Main hook (gom API lại cho tiện dùng)
// ===============================
export const useContract = () => {
  const axios = useAxiosInstance();
  const staffId = useStaffId(axios);

  const fetchHandoverOrders = useCallback(
    () => fetchHandoverOrdersFn(axios),
    [axios]
  );

  const approveHandover = (orderId) => approveHandoverFn(axios, orderId);

  const deliverVehicle = (orderId) => deliverVehicleFn(axios, staffId, orderId);

  const rejectHandover = (orderId) => rejectHandoverFn(axios, orderId);

  return {
    staffId,
    fetchHandoverOrders,
    approveHandover,
    deliverVehicle,
    rejectHandover,
  };
};
