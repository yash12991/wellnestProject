import { Router } from "express";

import {
  login,
  logout,
  register,
  verifyOTP,
  resendOTP,
  completeOnboarding,
  requestPasswordReset,
  resetPasswordWithOTP,
  refreshAccessToken,
  updateProfile,
  deleteUser,
  changePassword,
  displayCurrentUser,
  getUserProfile,
} from "../controllers/users.controllers.js";
import { checksession, verifyJWT } from "../middleware/auth.middleware.js";



const router = Router();

// Authentication routes
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/onboarding", completeOnboarding);
// Password Reset Flow
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithOTP);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.get("/profile", verifyJWT, getUserProfile);
router.patch("/update-profile", verifyJWT, updateProfile);
router.patch("/change-password", verifyJWT, changePassword);
router.delete("/delete-account", verifyJWT, deleteUser);
router.get("/me", verifyJWT, displayCurrentUser);

export default router;