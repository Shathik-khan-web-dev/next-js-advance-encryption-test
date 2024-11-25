const isProduction = process.env.NODE_ENV === "production";
// const isProduction = process.env.NODE_ENV === "development";

export default {
  isProduction,
  apiUrl: process.env.NEXTAUTH_URL || "http://localhost:4000",
  secretKey: process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY,
};
