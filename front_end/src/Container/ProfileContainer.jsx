"use client"

import { useState, useEffect } from "react"
import { message } from "antd"
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { userAPI, driverLicenseVerifyAPI, cccdVerifyAPI } from "../api/api"
import ProfileView from "../Components/Common/View/ProfileView"

export default function ProfileContainer() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch verification status helper
  const fetchVerificationStatus = async (userId) => {
    try {
      const licenseResponse = await driverLicenseVerifyAPI.getByRenterId(userId)
      const cccdResponse = await cccdVerifyAPI.getByRenterId(userId)
      
      // Handle both array and object responses
      const licenseData = Array.isArray(licenseResponse) ? licenseResponse[0] : licenseResponse
      const cccdData = Array.isArray(cccdResponse) ? cccdResponse[0] : cccdResponse
      
      const licenseVerified = licenseData?.is_verified === true || licenseData?.status === 1
      const idCardVerified = cccdData?.is_verified === true || cccdData?.status === 1
      
      // Set isVerified to true ONLY if BOTH are verified
      const isFullyVerified = licenseVerified && idCardVerified
      
      return {
        licenseVerified,
        licenseVerifiedAt: licenseData?.verified_at || licenseData?.verifiedAt,
        idCardVerified,
        idCardVerifiedAt: cccdData?.verified_at || cccdData?.verifiedAt,
        isVerified: isFullyVerified
      }
    } catch (err) {
      console.error("⚠️ Error fetching verification status:", err)
      return {
        licenseVerified: false,
        licenseVerifiedAt: null,
        idCardVerified: false,
        idCardVerifiedAt: null,
        isVerified: false
      }
    }
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

  // Upload giấy phép lái xe
  const handleUploadLicense = async (files) => {
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
        content: `Đang tải lên ${files.length} ảnh giấy phép lái xe...`,
        key: "uploadLicense",
      })

      console.log("📤 Uploading license images:", files.length, "files")

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
      console.log("✅ License images converted to base64")

      // Prepare data for API
      const uploadData = {
        renterId: user.id || user.userId,
        renterName: user.fullName || user.username || "Unknown",
        licenseNumber: user.licenseNumber || "PENDING",
        frontImageUrl: urls[0] || "",
        backImageUrl: urls[1] || urls[0] || ""
      }

      console.log("📡 Sending to backend API:", uploadData)

      // Call backend API
      const response = await driverLicenseVerifyAPI.uploadLicense(uploadData)
      console.log("✅ Backend response:", response)

      // Update localStorage
      const updatedUser = {
        ...user,
        licenseImages: urls,
        licenseVerified: false,
        licenseUploadedAt: new Date().toISOString(),
        licenseId: response.id
      }

      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      message.success({
        content: `✅ Đã gửi ${files.length} ảnh giấy phép lái xe đến staff để xác thực!`,
        key: "uploadLicense",
        duration: 5
      })

      return response
    } catch (err) {
      console.error("❌ License upload error:", err)
      message.error({
        content: err.message || "❌ Tải ảnh thất bại! Vui lòng thử lại.",
        key: "uploadLicense",
      })
      throw err
    }
  }

  // Upload CCCD/CMND
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

      // Prepare data for API
      const uploadData = {
        renterId: user.id || user.userId,
        renterName: user.fullName || user.username || "Unknown",
        cccdNumber: user.cccdNumber || user.idCardNumber || "PENDING",
        fullName: user.fullName || user.username || "Unknown",
        dob: user.dob || user.dateOfBirth || new Date().toISOString(),
        address: user.address || "Chưa cập nhật",
        frontImageUrl: urls[0] || "",
        backImageUrl: urls[1] || urls[0] || ""
      }

      console.log("📡 Sending CCCD to backend API:", uploadData)

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
    <ProfileView 
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