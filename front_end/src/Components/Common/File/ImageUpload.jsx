import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const UploadToCloudinary = ({onUpload}) => {
  const uploadProps = {
    name: "file",
    customRequest: async ({ file, onSuccess, onError }) => {
      const url = "https://api.cloudinary.com/v1_1/duongkien/image/upload";
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ev_rental_upload");

      try {
        const res = await fetch(url, { method: "POST", body: data });
        const result = await res.json();
        onSuccess(result);
        message.success("Upload thành công!");
        console.log("URL:", result.secure_url);
        onUpload?.(result.secure_url);
      } catch (err) {
        onError(err);
        message.error("Upload thất bại!");
      }
    },
  };

  return (
    <Upload {...uploadProps} listType="picture-card">
      <PlusOutlined />
      <div>Upload</div>
    </Upload>
  );
};

export default UploadToCloudinary;
