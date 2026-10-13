import jwt from "jsonwebtoken";
import User from "../models/user.js";

const requireAdmin = async (req, res, next) => {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Sign in with an administrator account to continue.",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(503).json({
      success: false,
      message: "Authentication is temporarily unavailable.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== "object" || typeof payload.userId !== "string") {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid. Please sign in again.",
      });
    }

    const user = await User.findById(payload.userId).select("fullName email role");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your account could not be found. Please sign in again.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access is required.",
      });
    }

    req.admin = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    console.error("Administrator authentication error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access.",
    });
  }
};

export default requireAdmin;
