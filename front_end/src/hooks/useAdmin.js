import { useState, useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useAdmin = () => {
  const api = useAxiosInstance(); // Use axios instance with baseURL configured
  const [frontLicenseUrl, setFrontLicenseUrl] = useState("");
  const [backLicenseUrl, setBackLicenseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] =   useState(null);
  const [isVerified, setIsVerified] = useState(false); // current verification status of the license

  const verifyRenter = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.put(`/Renters/VerifyRenter/${id}`);
        if (response.data?.isVerified !== undefined) {
          setIsVerified(response.data.isVerified);
        } else {
          // If API does not return isVerified, set to true by default
          setIsVerified(true);
        }
        return response.data;
      } catch (err) {
        console.error("Error fetching driver license:", err);
        setError("Cannot load images.");
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
