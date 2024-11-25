import axios from "axios";
import { encryptData, decryptData } from "@/client/utils/encryptDecrypt";
import config from "@/config";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor (Encrypt Data Before Sending Request)
apiClient.interceptors.request.use(
  (config) => {
    if (config.data && config.data.payload) {
      // Encrypt the payload data in production mode
      if (config.data.payload && config.data.payload !== "") {
        config.data.payload = encryptData(config.data.payload);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Decrypt Data After Receiving Response)
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      // Decrypt the response data in production mode
      if (config.isProduction && response.data.encrypted) {
        response.data = decryptData(response.data.encrypted);
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
