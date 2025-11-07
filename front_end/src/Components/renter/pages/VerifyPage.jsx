import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  Card,
  message,
  Spin,
} from "antd";
import {
  InboxOutlined,
} from "@ant-design/icons";
import { useCccd } from "../../../hooks/useCccd";
import { useDriverLicense } from "../../../hooks/useDriverLicense";
import { useCloudinary } from "../../../hooks/useCloudinary";
import { useAxiosInstance } from "../../../hooks/useAxiosInstance";
import VerifiedSuccessPage from "./VerifiedSuccessPage";

const { Dragger } = Upload;

export default function VerifyPage() {
  const { uploadCccd } = useCccd();
  const { uploadDriverLicense } = useDriverLicense();
  const { uploadToCloudinary } = useCloudinary();
  const instance = useAxiosInstance();

  const [loading, setLoading] = useState(true);
  const [cccdData, setCccdData] = useState(null);
  const [licenseData, setLicenseData] = useState(null);
  const [loadingCccd, setLoadingCccd] = useState(false);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [renterInfo, setRenterInfo] = useState(null);

  // Fetch verification status
  const fetchVerificationStatus = useCallback(async () => {
    try {
      const renterId =
        localStorage.getItem("renterId") ||
        localStorage.getItem("renter_Id") ||
        localStorage.getItem("renter_id");

      if (!renterId) {
        console.error("❌ No renterId found");
        setLoading(false);
        return;
      }

      let renterName = "";

      // Fetch Renter info
      try {
        const rentersRes = await instance.get(`/Users`);
        const renters = Array.isArray(rentersRes.data)
          ? rentersRes.data
          : rentersRes.data?.data || [];
        const renterData = renters.find(r => r.id === Number(renterId));
        setRenterInfo(renterData || null);
        if (renterData?.fullName) {
          renterName = renterData.fullName;
        }
        console.log("👤 Renter Info:", renterData);
      } catch (err) {
        console.error("Error fetching Renter info:", err);
        setRenterInfo(null);
      }

      // Fetch CCCD
      try {
        const cccdRes = await instance.get(`/Cccds?renterId=${renterId}`);
        const cccds = Array.isArray(cccdRes.data)
          ? cccdRes.data
          : cccdRes.data?.data || [];
        const renterCccd = cccds.find(
          (c) =>
            (c.renter_Id || c.renterId) === Number(renterId) ||
            (c.renter_id || c.renterId) === Number(renterId)
        );
        // Attach renterName to CCCD data
        if (renterCccd) {
          renterCccd.renter = { id: renterId, full_name: renterName };
        }
        setCccdData(renterCccd || null);
        console.log("📋 CCCD Data:", renterCccd);
      } catch (err) {
        console.error("Error fetching CCCD:", err);
        setCccdData(null);
      }

      // Fetch Driver License
      try {
        const licenseRes = await instance.get(
          `/DriverLicenses?renterId=${renterId}`
        );
        const licenses = Array.isArray(licenseRes.data)
          ? licenseRes.data
          : licenseRes.data?.data || [];
        const renterLicense = licenses.find(
          (l) =>
            (l.renter_Id || l.renterId) === Number(renterId) ||
            (l.renter_id || l.renterId) === Number(renterId)
        );
        // Attach renterName to License data
        if (renterLicense) {
          renterLicense.renter = { id: renterId, full_name: renterName };
        }
        setLicenseData(renterLicense || null);
        console.log("📋 License Data:", renterLicense);
      } catch (err) {
        console.error("Error fetching License:", err);
        setLicenseData(null);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setLoading(false);
    }
  }, [instance]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  // Check if both verified
  const isCccdVerified = cccdData?.is_verified === 1 || cccdData?.isVerified === true;
  const isLicenseVerified = licenseData?.is_verified === 1 || licenseData?.isVerified === true;
  const bothVerified = isCccdVerified && isLicenseVerified;

  // If already verified - show success page
  if (!loading && bothVerified) {
    return <VerifiedSuccessPage />;
  }

  // ================= CCCD =================
  const handleCccdSubmit = async (values) => {
    try {
      const frontFile = values.front?.[0]?.originFileObj;
      const backFile = values.back?.[0]?.originFileObj;

      if (!frontFile || !backFile) {
        message.warning("Vui lòng tải lên đủ 2 mặt CCCD!");
        return;
      }

      setLoadingCccd(true);
      message.loading("Đang upload ảnh CCCD lên Cloudinary...");

      const frontUrl = await uploadToCloudinary(frontFile);
      const backUrl = await uploadToCloudinary(backFile);

      const payload = {
        url_Cccd_Cmnd_front: frontUrl,
        url_Cccd_Cmnd_back: backUrl,
        id_Card_Number: values.idNumber,
      };

      await uploadCccd(payload);
      message.success("✅ Upload CCCD thành công!");
      fetchVerificationStatus();
    } catch (err) {
      console.error("❌ Upload CCCD error:", err?.response?.data || err);
      message.error("Có lỗi xảy ra khi upload CCCD!");
    } finally {
      setLoadingCccd(false);
    }
  };

  // ================= Driver License =================
  const handleLicenseSubmit = async (values) => {
    try {
      const frontFile = values.licenseFront?.[0]?.originFileObj;
      const backFile = values.licenseBack?.[0]?.originFileObj;

      if (!frontFile || !backFile) {
        message.warning("Vui lòng tải lên đủ 2 mặt bằng lái xe!");
        return;
      }

      setLoadingLicense(true);
      message.loading("Đang upload ảnh bằng lái xe lên Cloudinary...");

      const frontUrl = await uploadToCloudinary(frontFile);
      const backUrl = await uploadToCloudinary(backFile);

      const payload = {
        url_Driver_License_front: frontUrl,
        url_Driver_License_back: backUrl,
        driverLicenseNumber: values.licenseNumber,
      };

      await uploadDriverLicense(payload);
      message.success("✅ Upload bằng lái xe thành công!");
      fetchVerificationStatus();
    } catch (err) {
      console.error("❌ Upload License error:", err?.response?.data || err);
      message.error("Có lỗi xảy ra khi upload bằng lái xe!");
    } finally {
      setLoadingLicense(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải trạng thái xác thực...</p>
        </div>
      </div>
    );
  }

  // If both verified - show success message
  if (bothVerified) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-3">
                Xác thực thành công!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Tài khoản của bạn đã được xác thực. Bạn có thể bắt đầu thuê xe
                ngay bây giờ.
              </p>
              <Button
                type="primary"
                size="large"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => (window.location.href = "/home")}
              >
                🏠 Quay về trang chủ
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If pending - show lock message
  if (cccdStatus.status === "pending" || licenseStatus.status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-yellow-50 border-2 border-yellow-400 shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-3xl font-bold text-yellow-600 mb-3">
                Chờ xác thực
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Giấy tờ của bạn đang được admin xem xét. Vui lòng chờ trong vòng
                24 giờ.
              </p>
              <p className="text-sm text-gray-500">
                Bạn sẽ nhận được thông báo khi admin xác thực hoặc từ chối giấy
                tờ.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔐 Xác thực tài khoản
          </h1>
          <p className="text-gray-600">
            Hoàn thành xác thực giấy tờ để có thể thuê xe
          </p>
        </div>

        {/* Hai Card song song */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* --- CCCD --- */}
          <Card title="📄 Xác thực CCCD/CMND" className="shadow-lg rounded-2xl">
            <Form layout="vertical" onFinish={handleCccdSubmit}>
              <Form.Item
                label="Số CCCD/CMND"
                name="idNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số CCCD/CMND!" },
                ]}
              >
                <Input placeholder="Nhập số CCCD hoặc CMND" />
              </Form.Item>

              <Form.Item
                label="Ảnh mặt trước CCCD"
                name="front"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  { required: true, message: "Vui lòng tải ảnh mặt trước!" },
                ]}
              >
                <Dragger
                  beforeUpload={() => false}
                  multiple={false}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Kéo hoặc chọn ảnh mặt trước</p>
                </Dragger>
              </Form.Item>

              <Form.Item
                label="Ảnh mặt sau CCCD"
                name="back"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  { required: true, message: "Vui lòng tải ảnh mặt sau!" },
                ]}
              >
                <Dragger
                  beforeUpload={() => false}
                  multiple={false}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Kéo hoặc chọn ảnh mặt sau</p>
                </Dragger>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingCccd}
                  block
                  className="rounded-lg"
                >
                  Gửi xác thực CCCD
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* --- Bằng lái xe --- */}
          <Card
            title="🚗 Xác thực Giấy phép lái xe"
            className="shadow-lg rounded-2xl"
          >
            <Form layout="vertical" onFinish={handleLicenseSubmit}>
              <Form.Item
                label="Số Giấy phép lái xe"
                name="licenseNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số bằng lái!" },
                ]}
              >
                <Input placeholder="Nhập số bằng lái xe" />
              </Form.Item>

              <Form.Item
                label="Ảnh mặt trước bằng lái"
                name="licenseFront"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  { required: true, message: "Vui lòng tải ảnh mặt trước!" },
                ]}
              >
                <Dragger
                  beforeUpload={() => false}
                  multiple={false}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Kéo hoặc chọn ảnh mặt trước</p>
                </Dragger>
              </Form.Item>

              <Form.Item
                label="Ảnh mặt sau bằng lái"
                name="licenseBack"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  { required: true, message: "Vui lòng tải ảnh mặt sau!" },
                ]}
              >
                <Dragger
                  beforeUpload={() => false}
                  multiple={false}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Kéo hoặc chọn ảnh mặt sau</p>
                </Dragger>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingLicense}
                  block
                  className="rounded-lg"
                >
                  Gửi bằng lái xe
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
