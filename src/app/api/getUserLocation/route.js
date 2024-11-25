import config from "@/config";
import { _get } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { getIPLocation } from "@/client/utils/getIPLocation";

export async function GET() {
  try {
    const apiResponse = await _get("https://api.ipify.org?format=json");

    const response = config.isProduction
      ? decryptData(apiResponse.encrypt)
      : apiResponse.encrypt;

    const ip = response.ip;
    // console.log("IP:", ip);

    const location = await getIPLocation(ip);
    return new Response(JSON.stringify(location), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch IP location" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
