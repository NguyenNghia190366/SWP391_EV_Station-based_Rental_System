import { useState, useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useAdmin = () => {
  const api = useAxiosInstance(); // Dùng axios instance có baseURL sẵn
  const [frontLicenseUrl, setFrontLicenseUrl] = useState("");
  const [backLicenseUrl, setBackLicenseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] =   useState(null);
  const [isVerified, setIsVerified] = useState(false); // trạng thái hiện tại của license

  const verifyRenter = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.put(`/Renters/VerifyRenter/${id}`);
        if (response.data?.isVerified !== undefined) {
          setIsVerified(response.data.isVerified);
        } else {
          // Nếu API không trả về gì, ta tự set true
          setIsVerified(true);
        }
        return response.data;
      } catch (err) {
        console.error("Lỗi khi lấy driver license:", err);
        setError("Không thể tải hình ảnh.");
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    frontLicenseUrl,
    backLicenseUrl,
    loading,
    error,
    isVerified,
    verifyRenter,
  };
};
