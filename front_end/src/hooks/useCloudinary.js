import { useCallback } from "react";

export const useCloudinary = () => {
  // ⚙️ Replace values with your Cloudinary Cloud Name and Upload Preset
  const CLOUD_NAME = "dnrsaldww";
  const UPLOAD_PRESET = "ev_rental_upload";

  // 🔹 Upload a single file (image/video) to Cloudinary
  const uploadToCloudinary = useCallback(async (file) => {
    // Quick validation: ensure we received a File/Blob
    if (!file || !(file instanceof Blob || file instanceof File)) {
      const msg = "Invalid file provided to uploadToCloudinary: expected File/Blob.";
      console.error(msg, { file });
      throw new Error(msg);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    // cloud_name isn't required in form but harmless; keep for clarity
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      // Helpful debug: log status and headers for diagnosing 400s
      console.log(`Cloudinary upload response status: ${res.status} ${res.statusText}`);

      // Try to parse JSON, but if parsing fails include raw text
      let body;
      try {
        body = await res.json();
      } catch (jsonErr) {
        const text = await res.text();
        console.warn("Cloudinary response is not JSON, raw text:", text);
        body = { raw: text };
      }

      // If Cloudinary returned an error message, surface it for easier debugging
      if (!res.ok) {
        console.error("Cloudinary upload failed:", { status: res.status, body });
        // Improve thrown error with backend message when available
        const msg = body?.error?.message || body?.raw || `Cloudinary upload failed with status ${res.status}`;
        throw new Error(msg);
      }

      if (body && body.secure_url) {
        console.log("✅ Uploaded:", body.secure_url);
        return body.secure_url;
      } else {
        console.error("Cloudinary upload response missing secure_url:", body);
        throw new Error("Upload failed: missing secure_url in Cloudinary response");
      }
    } catch (err) {
      console.error("❌ Cloudinary Upload Error:", err);
      throw err;
    }
  }, []);

  return { uploadToCloudinary };
};
