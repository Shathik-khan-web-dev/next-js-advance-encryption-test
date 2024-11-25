export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};

/* export function decryptPayload(req, res, next) {
  if (req.body.payload) {
    try {
      req.body = decryptData(req.body.payload); // Decrypt payload
    } catch (error) {
      return res.status(400).json({ message: "Invalid encrypted payload" });
    }
  }
  next(); // Proceed to next middleware/route handler
}
 */