import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/userModal";

dbConnect();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case "GET":
      try {
        // Fetch all users
        const users = await User.find(); 
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
      break;

    case "PUT":
      // Note: PUT requests are handled here, but the API endpoint should have a valid ID
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }
      try {
        const user = await User.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
      break;

    case "DELETE":
      // Note: DELETE requests are handled here, but the API endpoint should have a valid ID
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(204).end(); // No content
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
