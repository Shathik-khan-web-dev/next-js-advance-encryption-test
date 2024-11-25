"use server";

import { decryptData, encryptData } from "@/client/utils/encryptDecrypt";
import config from "@/config";

export default async function handler(req, res) {
  try {
    console.log("Incoming Request Body:", req.body);

    // Decrypt request payload if in production mode
    let decryptedData = req.body;
    if (config.isProduction && req.body.payload) {
      console.log("Production Mode: Decrypting request payload...");
      decryptedData = decryptData(req.body.payload);
      console.log("Decrypted Request Data:", decryptedData);
    } else {
      console.log("Development Mode: Using raw request body.");
    }

    // Process the decrypted data here (e.g., database queries, etc.)
    console.log("Processing data...");
    const responseData = {
      message: "Data processed successfully",
      data: decryptedData, // Replace with actual processed data
    };
    console.log("Response Data (before encryption):", responseData);

    // Encrypt the response data if in production mode
    if (config.isProduction) {
      console.log("Production Mode: Encrypting response data...");
      const encryptedResponse = encryptData(responseData);
      console.log("Encrypted Response Data:", encryptedResponse);
      return res.status(200).json({ encrypted: encryptedResponse });
    } else {
      console.log("Development Mode: Sending raw response data.");
      return res.status(200).json(responseData);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
