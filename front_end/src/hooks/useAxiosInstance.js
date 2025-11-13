import { useMemo } from "react";
import axios from "axios";
import { apiUrl } from "../config/env";

export const useAxiosInstance = (backup = false) => {
    // 🔐 Lấy token từ localStorage
    const token = localStorage.getItem("token");
    
    // 📋 Tạo instance axios với interceptor ngay lập tức (không chờ useEffect)
    const instance = useMemo(() => {
        const newInstance = axios.create({ 
            baseURL: !backup ? apiUrl : 'https://alani-uncorroboratory-sympetaly.ngrok-free.dev',
            headers: {
                'ngrok-skip-browser-warning': 'true', // ✅ Bypass ngrok warning page
                'Content-Type': 'application/json',
                // 🔑 Gắn token trực tiếp vào header nếu có
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });
        
        // ⚡ Thiết lập interceptor request để đảm bảo token luôn được gắn
        newInstance.interceptors.request.use((config) => {
            const currentToken = localStorage.getItem("token");
            if (currentToken) {
                config.headers["Authorization"] = `Bearer ${currentToken}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        
        return newInstance;
    }, [token]); // 🔄 Tạo lại instance khi token thay đổi

    return instance;
}