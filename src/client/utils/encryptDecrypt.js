import CryptoJS from "crypto-js";
import config from "@/config";

// Get the secret key from the environment variable
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;

// const isProduction = process.env.NODE_ENV === "production";
// const isProduction = process.env.NODE_ENV === "development";

export const encryptData = (data) => {
  if (!config.isProduction) {
    console.log("Development Mode: Data not encrypted:", data);
    return data;
  }
  /*   if (!isProduction) { 
    console.log("Development Mode: Data not encrypted:", data);
    return data;
  } */

  console.log("Production Mode: Encrypting data...", data);

  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const encryptedData = `${iv.toString(
    CryptoJS.enc.Hex
  )}:${encrypted.ciphertext.toString(CryptoJS.enc.Hex)}`;

  return encryptedData;
};

export const decryptData = (encryptedData) => {
  if (!config.isProduction) {
    console.log("Development Mode: Data not decrypted:", encryptedData);
    return encryptedData;
  }

  /*   if (!isProduction) {
    console.log("Development Mode: Data not decrypted:", encryptedData);
    return encryptedData; // Return raw data if not in production
  } */

  console.log("Production Mode: Decrypting data...", encryptedData);

  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

  // Split the IV and encrypted text
  const [ivString, encryptedText] = encryptedData.split(":");

  // Convert the IV from hex to Base64
  const ivBase64 = CryptoJS.enc.Hex.parse(ivString).toString(
    CryptoJS.enc.Base64
  );

  // Perform decryption
  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Hex.parse(encryptedText),
    },
    key,
    {
      iv: CryptoJS.enc.Base64.parse(ivBase64),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedObject = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  console.log("Decrypted Data:", decryptedObject);

  return decryptedObject;
};
