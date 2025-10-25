import jwt from "jsonwebtoken";
import { User } from "../Models/User.models.js";

// Helper to extract token from multiple possible sources
const extractToken = (req) => {
  return (
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim() ||
    req.headers["x-auth-token"] || // Mobile alternative
    req.body.token // Fallback (not ideal, but useful for testing)
  );
};

export const verifyJWT = async (req, res, next) => {
  try {
    const token = extractToken(req);

    console.log("Headers:", req.headers.authorization);
    console.log("Cookies:", req.cookies);
    console.log("User Agent:", req.headers["user-agent"]);
    console.log("Extracted token:", token ? "Present" : "Missing");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.error("ACCESS_TOKEN_SECRET not found in environment");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Token decoded successfully:", decodedToken._id);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({ success: false, message: "User not found" });
    }

    console.log("User verified:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired, please login again" });
    }

    return res.status(401).json({ success: false, message: error?.message || "Invalid token" });
  }
};

export const checksession = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      return res.status(409).json({ success: false, message: "User already logged in" });
    }

    next();
  } catch (error) {
    console.error("Session check error:", error.message);
    return res.status(500).json({ success: false, message: error?.message || "Session check error" });
  }
};
