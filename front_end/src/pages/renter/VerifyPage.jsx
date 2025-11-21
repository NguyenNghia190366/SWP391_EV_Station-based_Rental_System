import React, { useState, useEffect } from "react";
import { Form, Input, Upload, Button, Card, Spin } from "antd";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        toast.error("Please enter CCCD/CMND number!");
        return;
      }

      if (frontFiles.length === 0) {
        toast.error("Please upload the front side image!");
        return;
      }

      if (backFiles.length === 0) {
        toast.error("Please upload the back side image!");
        return;
      }

      // Validate ID number format
      const idNum = values.idNumber.trim();
      if (!/^\d{12}$/.test(idNum)) {
        toast.error("CCCD/ID number must be exactly 12 digits!");
        return;
      }

      const frontFile = frontFiles[0]?.originFileObj;
      const backFile = backFiles[0]?.originFileObj;

      if (!frontFile || !backFile) {
        toast.warn("Please upload both sides of the CCCD!");
        return;
      }

      setLoadingCccd(true);

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
      
      toast.success("✅ CCCD uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload CCCD error:", err);
      console.error("  Error response:", err?.response?.data);
      console.error("  Error status:", err?.response?.status);
      console.error("  Error message:", err?.message);
      toast.error(`An error occurred: ${err?.response?.data?.message || err?.message || "Unknown error"}`);
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
        toast.error("Please enter driver's license number!");
        return;
      }

      if (licenseFrontFiles.length === 0) {
        toast.error("Please upload the front side image of the license!");
        return;
      }

      if (licenseBackFiles.length === 0) {
        toast.error("Please upload the back side image of the license!");
        return;
      }

      // Validate license number format
      const licNum = values.licenseNumber.trim();
      if (!/^\d{12}$/.test(licNum)) {
        toast.error("Driver's license number must be exactly 12 digits!");
        return;
      }

      const frontFile = licenseFrontFiles[0]?.originFileObj;
      const backFile = licenseBackFiles[0]?.originFileObj;

      if (!frontFile || !backFile) {
        toast.warn("Please upload both sides of the driver's license!");
        return;
      }

      setLoadingLicense(true);
      toast.info("Uploading driver's license images to Cloudinary...");

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
      
      toast.success("✅ Driver's license uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload License error:", err);
      console.error("  Error response:", err?.response?.data);
      console.error("  Error status:", err?.response?.status);
      console.error("  Error message:", err?.message);
      toast.error(`An error occurred: ${err?.response?.data?.message || err?.message || "Unknown error"}`);
    } finally {
      setLoadingLicense(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={4000} />
      {/* Two cards side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* --- CCCD --- */}
        <Card
          title="📄 ID Verification (CCCD/CMND)"
          className="shadow-lg rounded-2xl"
        >
          <Form layout="vertical" onFinish={handleCccdSubmit}>
            <Form.Item
              label="ID Number (CCCD/CMND)"
              name="idNumber"
              rules={[{ required: true, message: "Please enter the ID number (CCCD/CMND)!" }]}
            >
              <Input
                placeholder="Enter CCCD or ID number"
                onBlur={(e) => {
                  const v = (e.target.value || "").toString().trim();
                  console.log('CCCD onBlur fired, value=', v);
                  if (v && !/^\d{12}$/.test(v)) {
                    toast.dismiss();
                    toast.error("CCCD/ID number must be exactly 12 digits!");
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="ID front image (CCCD/CMND)"
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
                <p className="ant-upload-text">Drag or click to upload front side image</p>
              </Dragger>
            </Form.Item>

            <Form.Item
              label="ID back image (CCCD/CMND)"
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
                <p className="ant-upload-text">Drag or click to upload back side image</p>
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
                Submit ID verification
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* --- Driver's License --- */}
        <Card
          title="🚗 Driver's License Verification"
          className="shadow-lg rounded-2xl"
        >
          <Form layout="vertical" onFinish={handleLicenseSubmit}>
            <Form.Item
              label="Driver's license number"
              name="licenseNumber"
              rules={[{ required: true, message: "Please enter the driver's license number!" }]}
            >
              <Input
                placeholder="Enter driver's license number"
                onBlur={(e) => {
                  const v = (e.target.value || "").toString().trim();
                  console.log('License onBlur fired, value=', v);
                  if (v && !/^\d{12}$/.test(v)) {
                    toast.dismiss();
                    toast.error("Driver's license number must be exactly 12 digits!");
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="Driver's license front image"
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
                <p className="ant-upload-text">Drag or click to upload front side image</p>
              </Dragger>
            </Form.Item>

            <Form.Item
              label="Driver's license back image"
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
                <p className="ant-upload-text">Drag or click to upload back side image</p>
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
                Submit driver's license
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}