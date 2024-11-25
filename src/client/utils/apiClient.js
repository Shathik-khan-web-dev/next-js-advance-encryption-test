// "use server";

import axios from "axios";
import config from "@/config";
import { encryptData, decryptData } from "@/client/utils/encryptDecrypt";

const isProduction = config.isProduction;
// console.log(isProduction);

// Create a custom axios instance
const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* apiClient.interceptors.response.use(
  (response) => {
    // Encrypt response data if production is enabled
    const encryptedResponseData = config.isProduction
      ? encryptData(response.data)
      : response.data;
    console.log("Encrypted Response Data:", encryptedResponseData);
    return { ...response, data: encryptedResponseData }; // Ensure the data is encrypted before returning
  },
  (error) => {
    console.error("Error in Response Interceptor:", error);
    return Promise.reject(error);
  }
); 
 */
// Add query parameters dynamically to a URL
const addQueryParams = (url, params) => {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${url}?${queryString}` : url;
};

// API methods with encryption/decryption
const _get = async (url, data = {}) => {
  try {
    const { action, ...body } = data;
    /*    console.log("Initial URL:", url);
    console.log("Query Parameters (data):", data);
    console.log("Environment (isProduction):", isProduction); */

    // Encrypt query parameters if in production
    const params = body;
    // console.log("Processed Query Parameters:", params);

    const fullUrl = addQueryParams(url, params); // Add encrypted or plain query params to the URL
    // console.log("Full URL with Query Parameters:", fullUrl);

    // Make the GET request 
    const response = await apiClient.get(fullUrl);
    // console.log("Response Status:", response.status);
    // console.log("Response Data:", response.data);

    return {
      encrypt: config.isProduction ? encryptData(response.data) : response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error in _get:", error.response?.data || error.message);
    throw error;
  }
};

/* 
const _get = async (url, data = {}) => {
  try {
    console.log("Initial URL:", url);
    console.log("Query Parameters (data):", data);

    // Extract controllerName and encrypt the remaining data as the payload
    const { controllerName, ...queryParams } = data;

    if (!controllerName) {
      throw new Error("controllerName is required.");
    }

    // Encrypt the remaining data if in production
    const payload = config.isProduction
      ? encryptData(queryParams)
      : queryParams;

    // Construct the URL with controllerName and payload
    const fullUrl = `${url}?controllerName=${controllerName}&payload=${payload}`;
    console.log("Constructed URL:", fullUrl);

    // Make the GET request
    const response = await apiClient.get(fullUrl);

    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);

    return {
      data: config.isProduction ? encryptData(response.data) : response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error in _get:", error.response?.data || error.message);
    throw error;
  }
}; */
const _post = async (url, data = {}) => {
  try {
    /*     console.log("Request URL:", url);
    console.log("Original Request Data:", data); */

    // Extract controllerName from the data
    const { controllerName, ...payloadData } = data;

    // Add controllerName as a query parameter to the URL
    const fullUrl = controllerName
      ? `${url}?controllerName=${controllerName}`
      : url;

    // console.log("Full URL with controllerName:", fullUrl);

    // Encrypt the remaining data if in production
    const requestData = config.isProduction
      ? { payload: encryptData(payloadData) }
      : payloadData;

    /*     console.log(
      "Processed Request Data (without controllerName):",
      requestData
    );
 */
    // Make the POST request
    const response = await apiClient.post(fullUrl, requestData);

    /*     console.log("Response Status:", response.status); */
    /*     console.log("Raw Response Data:", response.data); */

    // Return response data and status
    return {
      encrypt: config.isProduction ? encryptData(response.data) : response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error in _post:", error.response?.data || error.message);
    throw error;
  }
};

const _put = async (url, data = {}) => {
  // console.log("Request URL:", url);
  // console.log("Request Data:", data);

  try {
    // Extract controllerName from the data
    const { controllerName, ...payloadData } = data;

    // Add controllerName as a query parameter to the URL if it exists
    const fullUrl = controllerName
      ? `${url}?controllerName=${controllerName}`
      : url;

    // console.log("Full URL with controllerName:", fullUrl);

    // Encrypt the payload data if in production mode
    const requestData = config.isProduction
      ? { payload: encryptData(payloadData) }
      : payloadData;

    // Make the PUT request
    const response = await apiClient.put(fullUrl, requestData);
    // console.log("API Response:", response);

    return {
      encrypt: config.isProduction ? encryptData(response.data) : response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error in _put:", error);
    throw error;
  }
};

const _delete = async (url, data = {}) => {
  try {
    // console.log("DELETE Request URL:", url);
    // console.log("Original Data:", data);

    // Extract controllerName from the data
    const { controllerName, ...payloadData } = data;

    // Add controllerName as a query parameter to the URL if it exists
    const fullUrl = controllerName
      ? `${url}?controllerName=${controllerName}`
      : url;

    // console.log("Full URL with controllerName:", fullUrl);

    // Encrypt the payload data if in production mode
    const requestData = config.isProduction
      ? { payload: encryptData(payloadData) }
      : payloadData;

    // console.log(
    //   "Processed Request Data (encrypted if production):",
    //   requestData
    // );

    // Make the DELETE request
    const response = await apiClient.delete(fullUrl, {
      data: requestData, // Axios supports sending data with DELETE requests
    });

    // console.log("Response Status:", response.status);
    // console.log("Response Data:", response.data);

    // Return response data and status
    return {
      encrypt: config.isProduction ? encryptData(response.data) : response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error in _delete:");
    throw error;
  }
};

const _patch = async (url) => {
  console.log(url);

  try {
    // Prepare request payload
    const requestData = isProduction ? { payload: encryptData(url) } : url;

    // Send the PATCH request
    const response = await apiClient.patch(requestData);

    // Handle response (decrypt in production if needed)
    const responseData = isProduction
      ? decryptData(response.data.payload)
      : response.data;

    return responseData;
  } catch (error) {
    console.error("Error in _patch:", error);
    throw error;
  }
};

export { _get, _post, _put, _delete, _patch };
