import React, { useState, useEffect } from "react";
import { Form, Input, Upload, Button, Card, message, Spin } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as yup from "yup";
import { useCccd } from "../../hooks/useCccd";
import { useDriverLicense } from "@/hooks/useDriverLicense";
import { useCloudinary } from "../../hooks/useCloudinary";
import { useAxiosInstance } from "../../hooks/useAxiosInstance";
import VerifiedSuccessPage from "./VerifiedSuccessPage";

const { Dragger } = Upload;

export default function VerifyPage() {
  const { uploadCccd } = useCccd();
  const { uploadDriverLicense } = useDriverLicense();
  const { uploadToCloudinary } = useCloudinary();
  const instance = useAxiosInstance();
  const [form] = Form.useForm(); // Get form instance to manually set field values
  
  const [loadingCccd, setLoadingCccd] = useState(false);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Check verification status from Renter table
  useEffect(() => {
    const checkVerification = async () => {
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

        // Fetch Renter to get is_verified field
        const rentersRes = await instance.get(`/Renters`);
        const renters = Array.isArray(rentersRes.data)
          ? rentersRes.data
          : rentersRes.data?.data || [];
        
        console.log("📊 All Renters:", renters);
        console.log("🔑 Looking for renterId:", renterId);
        
        // Fix: The field name is 'renterId', not 'id'
        const renterData = renters.find(r => r.renterId === Number(renterId));
        
        console.log("👤 Found Renter:", renterData);
        
        if (renterData) {
          // API returns 'isVerified' (camelCase), not 'is_verified'
          const verifiedValue = renterData.isVerified || renterData.is_verified;
          console.log("🔍 Checking isVerified field:");
          console.log("   - renterData.isVerified:", renterData.isVerified);
          console.log("   - Type:", typeof renterData.isVerified);
          
          // Handle multiple possible values: true, 1, "1", "true"
          const verified = 
            verifiedValue === true ||
            verifiedValue === 1 ||
            verifiedValue === "1" ||
            verifiedValue === "true";
            
          setIsVerified(verified);
          console.log("✅ Final verified status:", verified);
        } else {
          console.log("Renter not found with id:", renterId);
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, []);

  // If loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  // If verified, show success page
  if (isVerified) {
    return <VerifiedSuccessPage />;
  }

  // ================= CCCD =================
  // ================= CCCD =================
  const handleCccdSubmit = async (values) => {
    try {
      console.log("📝 Form values (CCCD):", values);
      console.log("📝 Front files:", values.front);
      console.log("📝 Back files:", values.back);

      // Check file arrays directly (Ant Design Upload returns array of objects with { uid, name, originFileObj, etc })
      const frontFiles = Array.isArray(values.front) ? values.front.filter(f => f) : [];
      const backFiles = Array.isArray(values.back) ? values.back.filter(f => f) : [];

      console.log("🔍 Filtered front files:", frontFiles);
      console.log("🔍 Filtered back files:", backFiles);

      // Simple validation without Yup - just check if data exists
      if (!values.idNumber || !values.idNumber.trim()) {
        message.error("Vui lòng nhập số CCCD/CMND!");
        return;
      }

      if (frontFiles.length === 0) {
        message.error("Vui lòng tải ảnh mặt trước!");
        return;
      }

      if (backFiles.length === 0) {
        message.error("Vui lòng tải ảnh mặt sau!");
        return;
      }

      // Validate ID number format
      const idNum = values.idNumber.trim();
      if (!/^\d{9}$|^\d{12}$/.test(idNum)) {
        message.error("Số CCCD/CMND phải có 9 hoặc 12 chữ số!");
        return;
      }

      const frontFile = frontFiles[0]?.originFileObj;
      const backFile = backFiles[0]?.originFileObj;

      if (!frontFile || !backFile) {
        message.warning("Vui lòng tải lên đủ 2 mặt CCCD!");
        return;
      }

      setLoadingCccd(true);
      message.loading("Đang upload ảnh CCCD lên Cloudinary...");

      const frontUrl = await uploadToCloudinary(frontFile);
      const backUrl = await uploadToCloudinary(backFile);

      console.log("✅ Cloudinary URLs:", { frontUrl, backUrl });

      const payload = {
        url_Cccd_Cmnd_front: frontUrl,
        url_Cccd_Cmnd_back: backUrl,
        id_Card_Number: values.idNumber,
      };

      console.log("📤 Sending payload to backend:", payload);
      const response = await uploadCccd(payload);
      console.log("✅ Backend response:", response);
      
      message.success("✅ Upload CCCD thành công!");
    } catch (err) {
      console.error("❌ Upload CCCD error:", err);
      console.error("  Error response:", err?.response?.data);
      console.error("  Error status:", err?.response?.status);
      console.error("  Error message:", err?.message);
      message.error(`Có lỗi xảy ra: ${err?.response?.data?.message || err?.message || "Lỗi không xác định"}`);
    } finally {
      setLoadingCccd(false);
    }
  };

  // ================= Driver License =================
  const handleLicenseSubmit = async (values) => {
    try {
      console.log("📝 Form values (License):", values);

      // Check file arrays directly (filter for actual files with originFileObj)
      const licenseFrontFiles = Array.isArray(values.licenseFront) ? values.licenseFront.filter(f => f) : [];
      const licenseBackFiles = Array.isArray(values.licenseBack) ? values.licenseBack.filter(f => f) : [];

      console.log("🔍 Filtered licenseFront files:", licenseFrontFiles);
      console.log("🔍 Filtered licenseBack files:", licenseBackFiles);
      
      // DEBUG: Log full file object structure
      if (licenseFrontFiles.length > 0) {
        console.log("🔎 licenseFrontFiles[0] full structure:", licenseFrontFiles[0]);
        console.log("   - originFileObj:", licenseFrontFiles[0]?.originFileObj);
        console.log("   - All keys:", Object.keys(licenseFrontFiles[0] || {}));
      }
      if (licenseBackFiles.length > 0) {
        console.log("🔎 licenseBackFiles[0] full structure:", licenseBackFiles[0]);
        console.log("   - originFileObj:", licenseBackFiles[0]?.originFileObj);
        console.log("   - All keys:", Object.keys(licenseBackFiles[0] || {}));
      }

      // Simple validation without Yup
      if (!values.licenseNumber || !values.licenseNumber.trim()) {
        message.error("Vui lòng nhập số bằng lái!");
        return;
      }

      if (licenseFrontFiles.length === 0) {
        message.error("Vui lòng tải ảnh mặt trước!");
        return;
      }

      if (licenseBackFiles.length === 0) {
        message.error("Vui lòng tải ảnh mặt sau!");
        return;
      }

      // Validate license number format
      const licNum = values.licenseNumber.trim();
      if (!/^\d{9,12}$/.test(licNum)) {
        message.error("Số bằng lái phải có 9-12 chữ số!");
        return;
      }

      const frontFile = licenseFrontFiles[0]?.originFileObj;
      const backFile = licenseBackFiles[0]?.originFileObj;

      if (!frontFile || !backFile) {
        message.warning("Vui lòng tải lên đủ 2 mặt bằng lái xe!");
        return;
      }

      setLoadingLicense(true);
      message.loading("Đang upload ảnh bằng lái xe lên Cloudinary...");

      const frontUrl = await uploadToCloudinary(frontFile);
      const backUrl = await uploadToCloudinary(backFile);

      console.log("✅ Cloudinary URLs:", { frontUrl, backUrl });

      const payload = {
        url_Driver_License_front: frontUrl,
        url_Driver_License_back: backUrl,
        driverLicenseNumber: values.licenseNumber,
      };

      console.log("📤 Sending payload to backend:", payload);
      const response = await uploadDriverLicense(payload);
      console.log("✅ Backend response:", response);
      
      message.success("✅ Upload bằng lái xe thành công!");
    } catch (err) {
      console.error("❌ Upload License error:", err);
      console.error("  Error response:", err?.response?.data);
      console.error("  Error status:", err?.response?.status);
      console.error("  Error message:", err?.message);
      message.error(`Có lỗi xảy ra: ${err?.response?.data?.message || err?.message || "Lỗi không xác định"}`);
    } finally {
      setLoadingLicense(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      {/* Hai Card song song */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* --- CCCD --- */}
        <Card
          title="📄 Xác thực CCCD/CMND"
          className="shadow-lg rounded-2xl"
        >
          <Form layout="vertical" onFinish={handleCccdSubmit}>
            <Form.Item
              label="Số CCCD/CMND"
              name="idNumber"
              rules={[{ required: true, message: "Vui lòng nhập số CCCD/CMND!" }]}
            >
              <Input placeholder="Nhập số CCCD hoặc CMND" />
            </Form.Item>

            <Form.Item
              label="Ảnh mặt trước CCCD"
              name="front"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList || []}
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
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList || []}
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
              rules={[{ required: true, message: "Vui lòng nhập số bằng lái!" }]}
            >
              <Input placeholder="Nhập số bằng lái xe" />
            </Form.Item>

            <Form.Item
              label="Ảnh mặt trước bằng lái"
              name="licenseFront"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList || []}
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
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList || []}
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
  );
}