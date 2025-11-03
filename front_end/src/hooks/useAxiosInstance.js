import { useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../config/env";

export const useAxiosInstance = () => {
    const token = localStorage.getItem("token");
    const instance = axios.create({ 
        baseURL: apiUrl,
        headers: {
            'ngrok-skip-browser-warning': 'true', // ✅ Bypass ngrok warning page
            'Content-Type': 'application/json'
        }
    });
    
    useEffect(() => {
        instance.interceptors.request.use((config) => {
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    }, [token, instance]);

    return instance;
}