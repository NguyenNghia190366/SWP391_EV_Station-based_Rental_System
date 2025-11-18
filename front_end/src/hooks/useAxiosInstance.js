import { useMemo } from "react";
import axios from "axios";
import { apiUrl } from "../config/env";

export const useAxiosInstance = (backup = false) => {
    //  Get token from localStorage
    const token = localStorage.getItem("token");
    
    // Create axios instance with interceptor immediately (not waiting for useEffect)
    const instance = useMemo(() => {
        const newInstance = axios.create({ 
            baseURL: !backup ? apiUrl : 'https://alani-uncorroboratory-sympetaly.ngrok-free.dev',
            headers: {
                'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
                'Content-Type': 'application/json',
                // Attach token to header if present
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });
        
        // Set up request interceptor to ensure token is always attached
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
    }, [token]); // Recreate instance when token changes

    return instance;
};