import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const authorization = req.headers.authorization;

    const bearerToken =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    const token = cookieToken || bearerToken;
    console.log("Cookie received:", Boolean(req.cookies?.token));
      console.log(
        "Authorization header received:",
        Boolean(req.headers.authorization)
      );

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");
      return res.status(500).json({
        message: "Server authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    const user = await User.findById(userId).select("_id name email");

    if (!user) {
      return res.status(401).json({
        message: "The authenticated user no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token. Please log in again.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

export default protect;