import React, { useState } from "react";
import { Form, Input, Upload, Button, Card, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useCccd } from "../hooks/useCccd";
import { useDriverLicense } from "../hooks/useDriverLicense";
import { useCloudinary } from "../hooks/useCloudinary";

const { Dragger } = Upload;

export default function VerifyPage() {
  const { uploadCccd } = useCccd();
  const { uploadDriverLicense } = useDriverLicense();
  const { uploadToCloudinary } = useCloudinary();
  const [loading, setLoading] = useState(false);

  // ================= CCCD =================
  const handleCccdSubmit = async (values) => {
    try {
      const frontFile = values.front?.[0]?.originFileObj;
      const backFile = values.back?.[0]?.originFileObj;

      if (!frontFile || !backFile) {
        message.warning("Vui lòng tải lên đủ 2 mặt CCCD!");
        return;
      }

      setLoading(true);
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
    } catch (err) {
      console.error("❌ Upload CCCD error:", err);
      message.error("Có lỗi xảy ra khi upload CCCD!");
    } finally {
      setLoading(false);
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

      setLoading(true);
      message.loading("Đang upload ảnh bằng lái xe lên Cloudinary...");

      const frontUrl = await uploadToCloudinary(frontFile);
      const backUrl = await uploadToCloudinary(backFile);

      const payload = {
        url_BangLai_front: frontUrl,
        url_BangLai_back: backUrl,
        license_Number: values.licenseNumber,
      };

      await uploadDriverLicense(payload);
      message.success("✅ Upload bằng lái xe thành công!");
    } catch (err) {
      console.error("❌ Upload License error:", err);
      message.error("Có lỗi xảy ra khi upload bằng lái xe!");
    } finally {
      setLoading(false);
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
              getValueFromEvent={(e) => e?.fileList}
              rules={[{ required: true, message: "Vui lòng tải ảnh mặt trước!" }]}
            >
              <Dragger beforeUpload={() => false} multiple={false} maxCount={1}>
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
              rules={[{ required: true, message: "Vui lòng tải ảnh mặt sau!" }]}
            >
              <Dragger beforeUpload={() => false} multiple={false} maxCount={1}>
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
                loading={loading}
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
              getValueFromEvent={(e) => e?.fileList}
              rules={[{ required: true, message: "Vui lòng tải ảnh mặt trước!" }]}
            >
              <Dragger beforeUpload={() => false} multiple={false} maxCount={1}>
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
              rules={[{ required: true, message: "Vui lòng tải ảnh mặt sau!" }]}
            >
              <Dragger beforeUpload={() => false} multiple={false} maxCount={1}>
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
                loading={loading}
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
