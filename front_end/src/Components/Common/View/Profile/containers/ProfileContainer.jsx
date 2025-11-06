import { useState, useEffect } from "react"
import { message } from "antd"
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { userAPI, driverLicenseVerifyAPI, cccdVerifyAPI } from "../../../../../api/api"
import ProfileViewNew from "../components/ProfileView"
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

export default function ProfileContainer() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch verification status helper
  // Backend API: /api/DriverLicenses/{id} and /api/Cccds/{id} - requires ID, not renterId
  // TODO: Ask backend teammate to add /api/DriverLicenses/renter/{renterId} endpoint
  const fetchVerificationStatus = async (userId) => {
    console.log(" Verification status check disabled - Backend API doesn't support GET by renterId yet")
    console.log(" Using localStorage verification status instead")
    
    // Return stored verification status from user object
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || '{}')
    return {
      licenseVerified: storedUser.licenseVerified || false,
      licenseVerifiedAt: storedUser.licenseVerifiedAt || null,
      idCardVerified: storedUser.idCardVerified || false,
      idCardVerifiedAt: storedUser.idCardVerifiedAt || null,
      isVerified: storedUser.isVerified || false
    }
    
    /* COMMENTED OUT - Backend endpoint not available yet
    try {
      // Fetch license verification status
      let licenseVerified = false
      let licenseVerifiedAt = null
      try {
        const licenseResponse = await driverLicenseVerifyAPI.getByRenterId(userId)
        const licenseData = Array.isArray(licenseResponse) ? licenseResponse[0] : licenseResponse
        licenseVerified = licenseData?.is_verified === true || licenseData?.status === 1
        licenseVerifiedAt = licenseData?.verified_at || licenseData?.verifiedAt
        console.log("✅ License verification status fetched:", { licenseVerified, licenseVerifiedAt })
      } catch (licenseErr) {
        // 404 is normal - user hasn't uploaded license yet
        if (licenseErr.message?.includes("404") || licenseErr.message?.includes("Không tìm thấy")) {
          console.log("No license verification found (user hasn't uploaded yet)")
        } else {
          console.error("Error fetching license verification:", licenseErr.message)
        }
      }

      // Fetch CCCD verification status
      let idCardVerified = false
      let idCardVerifiedAt = null
      try {
        const cccdResponse = await cccdVerifyAPI.getByRenterId(userId)
        const cccdData = Array.isArray(cccdResponse) ? cccdResponse[0] : cccdResponse
        idCardVerified = cccdData?.is_verified === true || cccdData?.status === 1
        idCardVerifiedAt = cccdData?.verified_at || cccdData?.verifiedAt
        console.log("CCCD verification status fetched:", { idCardVerified, idCardVerifiedAt })
      } catch (cccdErr) {
        // 404 is normal - user hasn't uploaded CCCD yet
        if (cccdErr.message?.includes("404") || cccdErr.message?.includes("Không tìm thấy")) {
          console.log("No CCCD verification found (user hasn't uploaded yet)")
        } else {
          console.error("Error fetching CCCD verification:", cccdErr.message)
        }
      }
      
      // Set isVerified to true ONLY if BOTH are verified
      const isFullyVerified = licenseVerified && idCardVerified
      
      return {
        licenseVerified,
        licenseVerifiedAt,
        idCardVerified,
        idCardVerifiedAt,
        isVerified: isFullyVerified
      }
    } catch (err) {
      console.error("⚠️ Unexpected error in fetchVerificationStatus:", err)
      return {
        licenseVerified: false,
        licenseVerifiedAt: null,
        idCardVerified: false,
        idCardVerifiedAt: null,
        isVerified: false
      }
    }
    */
  }

  // Load user từ localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("currentUser")
        const isLoggedIn = localStorage.getItem("isLoggedIn")

        if (isLoggedIn === "true" && storedUser) {
          const parsedUser = JSON.parse(storedUser)
          
          // Fetch verification status from backend
          if (parsedUser.id || parsedUser.userId) {
            const userId = parsedUser.id || parsedUser.userId
            
            const verificationStatus = await fetchVerificationStatus(userId)
            
            // Update user with verification status
            const updatedUser = {
              ...parsedUser,
              ...verificationStatus
            }
            
            // Save updated user to localStorage
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
            setUser(updatedUser)
          } else {
            setUser(parsedUser)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("❌ Error parsing user:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Auto-refresh verification status every 15 seconds
  // ⚠️ TEMPORARILY DISABLED - Backend API not ready yet
  // TODO: Re-enable when backend adds GET by renterId endpoint
  /*
  useEffect(() => {
    if (!user || !(user.id || user.userId)) return

    const userId = user.id || user.userId
    const interval = setInterval(async () => {
      const verificationStatus = await fetchVerificationStatus(userId)
      
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          ...verificationStatus
        }
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        return updatedUser
      })
      
      console.log("🔄 Verification status refreshed", verificationStatus)
    }, 15000) // 15 seconds

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.userId])
  */

  // Cập nhật thông tin user
  const handleUpdateUser = async (updatedForm) => {
    // Validate
    if (!updatedForm.fullName?.trim() && !updatedForm.name?.trim()) {
      message.error("Vui lòng nhập họ tên!")
      return
    }
    if (!updatedForm.email?.trim() || !updatedForm.email.includes("@")) {
      message.error("Email không hợp lệ!")
      return
    }
    if (!updatedForm.phoneNumber?.trim() || !/^[0-9]{10}$/.test(updatedForm.phoneNumber.trim())) {
      message.error("Số điện thoại không hợp lệ (phải có 10 số)!")
      return
    }

    try {
      message.loading({ content: "Đang cập nhật...", key: "updateUser" })

      // Gọi API cập nhật
      const result = await userAPI.updateUser(updatedForm)

      // Cập nhật localStorage và state
      localStorage.setItem("currentUser", JSON.stringify(result))
      setUser(result)

      message.success({
        content: " Cập nhật thành công!",
        key: "updateUser",
      })
    } catch (err) {
      console.error(" Update error:", err)
      message.error({
        content: err.message || " Cập nhật thất bại!",
        key: "updateUser",
      })
    }
  }

  // Cập nhật avatar
  const handleUpdateAvatar = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn file ảnh!")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("Dung lượng ảnh tối đa 5MB!")
      return
    }

    try {
      message.loading({
        content: "Đang tải lên ảnh đại diện...",
        key: "updateAvatar",
      })

      console.log(" Uploading avatar:", file.name, "Size:", (file.size / 1024).toFixed(2), "KB")

      // TEMPORARY: Convert to base64 and store locally until backend endpoint is ready
      const avatarUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result) // base64 string
        }
        reader.readAsDataURL(file)
      })
      
      console.log(" Avatar converted to base64")

      // Cập nhật thông tin user với URL ảnh mới
      const updatedUser = { 
        ...user, 
        avatar: avatarUrl,
        avatarUpdatedAt: new Date().toISOString()
      }

      // Cập nhật state và localStorage
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      message.success({
        content: " Cập nhật ảnh đại diện thành công! (Chế độ tạm thời - chờ backend API)",
        key: "updateAvatar",
        duration: 5
      })
    } catch (err) {
      console.error(" Avatar upload error:", err)
      message.error({
        content: err.message || " Cập nhật ảnh thất bại! Vui lòng thử lại.",
        key: "updateAvatar",
      })
      throw err
    }
  }

  // ------------------------------------------------
  const UploadToCloudinary = () => {
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
}

  // ==================== UPLOAD GIẤY PHÉP LÁI XE ====================
  const handleUploadLicense = async (files) => {
    // Validate input
    if (!files || files.length === 0) {
      message.warning("Vui lòng chọn ảnh!");
      return;
    }

    try {
      // Show loading message
      message.loading({
        content: `Đang tải lên ${files.length} ảnh giấy phép lái xe...`,
        key: "uploadLicense",
      });

      // ========== STEP 1: Convert images to base64 ==========
      const convertToBase64 = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      };

      const imageUrls = await Promise.all(files.map(convertToBase64));
      console.log("✅ License images converted to base64");

      // ========== STEP 2: Get and validate userId ==========
      // IMPORTANT: Backend saves as "renter_Id" (with capital I), prioritize that!
      const rawUserId = 
        localStorage.getItem("renter_Id") ||     // Priority 1: Backend key (capital I)
        localStorage.getItem("renter_id") ||    // Priority 2: snake_case
        localStorage.getItem("renterId") ||     // Priority 3: camelCase
        localStorage.getItem("userId") ||        // Fallback userId
        localStorage.getItem("user_id") ||       // Fallback user_id
        user?.renter_Id ||                       // From user object
        user?.renterId ||
        user?.renter_id ||
        user?.userId ||
        user?.user_id ||
        user?.id ||
        user?.Id;

      console.log("🔍 Raw userId:", rawUserId, typeof rawUserId);

      // Parse and validate userId
      let userId;
      if (typeof rawUserId === "number") {
        userId = rawUserId;
      } else if (typeof rawUserId === "string") {
        // Check if string is numeric (e.g., "7", "123")
        if (/^\d+$/.test(rawUserId)) {
          userId = parseInt(rawUserId, 10);
        } else {
          // String is not numeric (e.g., "temp_f_...")
          throw new Error(
            "Bạn cần đăng nhập với tài khoản thật để upload giấy tờ. " +
            "Tài khoản tạm thời không được phép upload."
          );
        }
      } else {
        throw new Error("Không tìm thấy user ID. Vui lòng đăng nhập lại.");
      }

      // Final validation
      if (isNaN(userId) || userId <= 0) {
        throw new Error("User ID không hợp lệ. Vui lòng đăng nhập lại.");
      }

      console.log("✅ Parsed userId:", userId, typeof userId);

      // ========== STEP 3: Prepare upload data ==========
      // IMPORTANT: renterId (from renter_Id) ≠ userId (from user_id)!
      // Get actual userId from localStorage separately
      const actualUserId = 
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        user?.userId ||
        user?.user_id ||
        userId; // fallback to renterId if no userId found
      
      const uploadData = {
        renterId: userId,  // This is renter_id = 1
        userId: parseInt(actualUserId, 10),  // This is user_id = 7
        driverLicenseNumber: user?.licenseNumber || "PENDING",
        urlDriverLicense: imageUrls[0] || "",
        backImageUrl: imageUrls[1] || imageUrls[0] || "",
        // User info for renter object
        renterName: user?.fullName || user?.userName || user?.username || "Unknown",
        fullName: user?.fullName || user?.userName || user?.username || "",
        email: user?.email || localStorage.getItem("email") || "",
        role: user?.role || localStorage.getItem("role") || "RENTER",
        status: user?.status || "active",
        address: user?.address || user?.currentAddress || "",
        cccdNumber: user?.cccdNumber || user?.idCardNumber || "",
      };

      console.log("📡 Sending to backend API:", uploadData);
      console.log("📋 renterId:", uploadData.renterId, "userId:", uploadData.userId);

      // ========== STEP 4: Upload to backend ==========
      const response = await driverLicenseVerifyAPI.uploadLicense(uploadData);
      console.log("✅ Backend response:", response);

      // ========== STEP 5: Update local state ==========
      const updatedUser = {
        ...user,
        licenseImages: imageUrls,
        licenseVerified: false,
        licenseUploadedAt: new Date().toISOString(),
        licenseId: response?.id,
      };

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Show success message
      message.success({
        content: `✅ Đã gửi ${files.length} ảnh giấy phép lái xe thành công!`,
        key: "uploadLicense",
        duration: 5,
      });

      return response;
    } catch (err) {
      console.error("❌ License upload error:", err);
      message.error({
        content: err.message || "❌ Tải ảnh thất bại! Vui lòng thử lại.",
        key: "uploadLicense",
      });
      throw err;
    }
  };

  // ==================== UPLOAD CCCD/CMND ====================
  const handleUploadIdCard = async (files) => {
    if (!files || files.length === 0) return

    // Validate files
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024
    )

    if (invalidFiles.length > 0) {
      message.error("Chỉ chấp nhận file ảnh và dung lượng tối đa 5MB!")
      return
    }

    try {
      message.loading({
        content: `Đang tải lên ${files.length} ảnh CCCD/CMND...`,
        key: "uploadIdCard",
      })

      console.log("📤 Uploading ID card images:", files.length, "files")

      // Convert to base64
      const uploadPromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result) // base64 string
          }
          reader.readAsDataURL(file)
        })
      })
      
      const urls = await Promise.all(uploadPromises)
      console.log("✅ ID card images converted to base64")

      
      // ✅ Parse userId - xử lý cả string và number
      let renterId = localStorage.getItem("renter_Id")

      const uploadData = {
        renter_id: renterId,
        url_Cccd_Cmnd_front: urls[0] || "",
        url_Cccd_Cmnd_back: urls[1] || urls[0] || "",
        id_Card_Number: ""
      }

      console.log("📡 Sending CCCD to backend API:", uploadData)
      console.log("📋 renterId type:", typeof uploadData.renterId)

      // Call backend API
      const response = await cccdVerifyAPI.uploadCCCD(uploadData)
      console.log("✅ Backend response:", response)

      // Update localStorage
      const updatedUser = {
        ...user,
        idCardImages: urls,
        idCardVerified: false,
        idCardUploadedAt: new Date().toISOString(),
        cccdId: response.id
      }

      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      message.success({
        content: `✅ Đã gửi ${files.length} ảnh CCCD/CMND đến staff để xác thực!`,
        key: "uploadIdCard",
        duration: 5
      })

      return response
    } catch (err) {
      console.error("❌ ID card upload error:", err)
      message.error({
        content: err.message || "❌ Tải ảnh thất bại! Vui lòng thử lại.",
        key: "uploadIdCard",
      })
      throw err
    }
  }

  // Submit verification - Gửi tất cả giấy tờ để xác thực
  const handleSubmitVerification = async (licenseFiles, idCardFiles) => {
    if ((!licenseFiles || licenseFiles.length === 0) && (!idCardFiles || idCardFiles.length === 0)) {
      message.warning("Vui lòng tải lên ít nhất một loại giấy tờ!")
      return
    }

    try {
      message.loading({
        content: "Đang gửi giấy tờ xác thực...",
        key: "submitVerification",
      })

      // Upload tất cả ảnh
      const uploadPromises = []
      
      if (licenseFiles && licenseFiles.length > 0) {
        uploadPromises.push(handleUploadLicense(licenseFiles))
      }
      
      if (idCardFiles && idCardFiles.length > 0) {
        uploadPromises.push(handleUploadIdCard(idCardFiles))
      }

      await Promise.all(uploadPromises)

      // Cập nhật trạng thái xác thực
      const updatedUser = {
        ...user,
        verificationStatus: "pending", // pending, approved, rejected
        verificationSubmittedAt: new Date().toISOString()
      }

      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      message.success({
        content: " Đã gửi giấy tờ xác thực! Chúng tôi sẽ xem xét trong 24-48 giờ.",
        key: "submitVerification",
        duration: 5,
      })
    } catch (err) {
      console.error(" Verification submit error:", err)
      message.error({
        content: err.message || " Gửi giấy tờ thất bại!",
        key: "submitVerification",
      })
    }
  }

  return (
    <ProfileViewNew 
      user={user} 
      loading={loading} 
      onUpdateUser={handleUpdateUser} 
      onUpdateAvatar={handleUpdateAvatar}
      onUploadLicense={handleUploadLicense}
      onUploadIdCard={handleUploadIdCard}
      onSubmitVerification={handleSubmitVerification}
    />
  )
}
