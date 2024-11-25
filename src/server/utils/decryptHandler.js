import config from "@/config";
import { decryptData } from "@/client/utils/encryptDecrypt";

export const getDecryptHandler = async (req) => {
  try {
    const { searchParams } = new URL(req.url); // Extract query parameters
    const payload = searchParams.get("payload"); // Retrieve payload

    console.log("Raw Payload:", payload);

    const decryptedData = config.isProduction
      ? decryptData(payload) // Decrypt in production
      : JSON.parse(payload); // Parse JSON string in development

    console.log("Decrypted Query Data:", decryptedData);

    return typeof decryptedData === "string"
      ? JSON.parse(decryptedData) // Parse again if decrypted result is still a string
      : decryptedData;
  } catch (error) {
    console.error("Error in getDecryptHandler:", error);
    throw new Error("Failed to parse or decrypt request");
  }
};

export const decryptHandler = async (req) => {
  console.log(req);

  try {
    const body = await req.json();
    const decryptedData = body.payload ? decryptData(body.payload) : body;
    console.log("Decrypted Request Data:", decryptedData);
    return decryptedData;
  } catch (error) {
    console.error("Error in decryptHandler:", error);
    throw new Error("Failed to parse or decrypt request");
  }
};

/* import { decryptData } from "@/client/utils/encryptDecrypt";

export const decryptHandler = async (req) => {
  try {
    // Parse the incoming request body
    const body = await req.json();

    // Decrypt the payload if present, else return the original body
    const decryptedData = body.payload
      ? { ...body, payload: decryptData(body.payload) }
      : body;

    // Optional: Log decrypted data for debugging (remove in production)
    console.log("Decrypted Request Data:", decryptedData);

    return decryptedData; // Return the decrypted data or the original body if no payload
  } catch (error) {
    console.error("Error in decryptHandler:", error);
    throw new Error("Failed to parse or decrypt request");
  }
}; */
