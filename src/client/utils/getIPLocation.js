import config from "@/config";
import { _get } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";

export const getIPLocation = async (ip) => {
  try {
    // console.log("Fetching IP Location for IP:", ip);
    const token = process.env.IPINFO_TOKEN; // Ensure this is set correctly in .env.local
    const apiResponse = await _get(
      `https://ipinfo.io/${ip}/json?token=${token}`
    );

    const response = config.isProduction
      ? decryptData(apiResponse.encrypt)
      : apiResponse.encrypt;

    return response;
  } catch (error) {
    throw new Error("Error fetching IP location");
  }
};
