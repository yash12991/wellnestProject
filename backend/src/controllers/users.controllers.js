import { response } from "express";
import { User } from "../Models/User.models.js";
import { HealthProfile } from "../Models/Analytics.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail } from "../config/email.js";
import { Cart, Product, Order } from "../Models/Ecommerce.model.js";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error.message);
    throw new Error("Failed to generate tokens");
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with email or username already exists"
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user with OTP
    const user = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      role,
      otp,
      otpExpiry,
      isVerified: false,
      isOnboardingComplete: false
    });

    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      // If email fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again or use google signup."
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for OTP verification.",
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified"
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Please complete your onboarding.",
      requiresOnboarding: !user.isOnboardingComplete
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified"
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again."
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP resent successfully! Please check your email."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Complete onboarding
// const completeOnboarding = async (req, res) => {
//   try {
//     const { userId, age, weight, height, gender, goals, medicalHistory, foodallergist } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required"
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     if (!user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Please verify your email first"
//       });
//     }

//     if (user.isOnboardingComplete) {
//       return res.status(400).json({
//         success: false,
//         message: "Onboarding already completed"
//       });
//     }

//     // Create health profile
//     const healthProfile = new HealthProfile({
//       user: userId,
//       age,
//       weight,
//       height,
//       gender,
//       goals,
//       medicalHistory,
//       foodallergist: foodallergist || "none"
//     });

//     await healthProfile.save();

//     // Update user
//     user.profile = healthProfile._id;
//     user.isOnboardingComplete = true;
//     await user.save();

//     // Generate tokens for login
//     const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(userId);

//     const options = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "None",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
//       path: "/",
//     };

//     const userResponse = await User.findById(userId)
//       .select("-password -refreshToken -otp -otpExpiry")
//       .populate('profile');

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", refreshToken, options)
//       .json({
//         success: true,
//         message: "Onboarding completed successfully! Welcome to Wellnest!",
//         user: userResponse,
//         accessToken,
//         refreshToken
//       });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };
const completeOnboarding = async (req, res) => {
  try {
    const {
      userId,
      age,
      gender,
      allergies,
      height,
      currentWeight,
      goalWeight,
      goals,        // Free-text or health goals
      preferences,  // Object with diet/activity preferences
      // Extra onboarding fields from frontend
      meatPreference,
      proteinVariety,  // NEW: Array of proteins user can eat
      specificDayPreferences,  // NEW: Day-specific protein rules
      activityLevel,
      fatigueTime,
      digestiveUpset,
      cravingsFrequency,
      cravingType,
      medicalConditions,
      foodsToAvoid
    } = req.body;

    // --- 1. Validate userId ---
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // --- 2. Find user ---
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    if (user.isOnboardingComplete) {
      return res.status(400).json({
        success: false,
        message: "Onboarding already completed",
      });
    }

    // --- 3. Update user fields ---
    if (gender) user.gender = gender;
    if (height) user.height = height;
    if (currentWeight) user.currentWeight = currentWeight;
    if (goalWeight) user.goalWeight = goalWeight;

    // Allergies: collect from explicit 'allergies' field and also from foodsToAvoid/medicalConditions if provided
    const allergyList = new Set();
    if (Array.isArray(allergies)) {
      allergies.forEach(a => a && allergyList.add(String(a).trim()));
    } else if (allergies) {
      allergyList.add(String(allergies).trim());
    }

    // foodsToAvoid may be a comma-separated string from frontend; include those as allergies/avoid list
    if (foodsToAvoid) {
      const parts = String(foodsToAvoid).split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => allergyList.add(p));
    }

    // medicalConditions may include allergy mentions (best-effort parse by commas)
    if (medicalConditions) {
      const parts = String(medicalConditions).split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => allergyList.add(p));
    }

    user.foodAllergies = Array.from(allergyList);

    // Preferences: merge old + new and include explicit onboarding preference fields
    const existingPrefs = user.preferences?.toObject?.() || user.preferences || {};
    user.preferences = {
      ...existingPrefs,
      ...(preferences || {}),
      meatPreference: meatPreference || existingPrefs.meatPreference,
      proteinVariety: proteinVariety || existingPrefs.proteinVariety || [],
      specificDayPreferences: specificDayPreferences || existingPrefs.specificDayPreferences || '',
      activityLevel: activityLevel || existingPrefs.activityLevel,
      fatigueTime: fatigueTime || existingPrefs.fatigueTime,
      digestiveUpset: digestiveUpset || existingPrefs.digestiveUpset,
      cravingsFrequency: cravingsFrequency || existingPrefs.cravingsFrequency,
      cravingType: cravingType || existingPrefs.cravingType,
      medicalConditions: medicalConditions || existingPrefs.medicalConditions,
      foodsToAvoid: foodsToAvoid || existingPrefs.foodsToAvoid,
      goals: goals || existingPrefs.goals
    };

    // --- 4. Create Health Profile ---
    const healthProfile = new HealthProfile({
      user: userId,
      age,
      gender: gender || user.gender,
      allergies: user.foodAllergies,
      height,
      currentWeight,
      goalWeight,
      goals,
    });

    await healthProfile.save();

    // Link to user
    user.profile = healthProfile._id;
    user.isOnboardingComplete = true;

    await user.save();

    // --- 5. Generate Tokens ---
    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(userId);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // Don't set domain for cross-domain requests - browser will handle it
      // domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
      path: "/",
    };

    // --- 6. Prepare response user (hide sensitive fields) ---
    const userResponse = await User.findById(userId)
      .select("-password -otp -otpExpiry -__v")
      .populate({
        path: "profile",
        select: "-__v -createdAt -updatedAt",
      });

    // --- 7. Send response ---
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "Onboarding completed successfully! 🎉 Welcome to Wellnest!",
        user: userResponse,
      });
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during onboarding",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;


    if (!(username || email)) {
      return res.status(400).json({
        success: false,
        message: "Username or email is required"
      });
    }

    const user = await User.findOne({
      $or: [{ username: username?.toLowerCase() }, { email }],
    }).populate('profile');


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with given username or email does not exist"
      });
    }

    const isPasswordValid = await user.comparePassword(password.trim());
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    // Check if user is verified


    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }


    // // Check if onboarding is complete
    // if (!user.isOnboardingComplete) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Please complete your onboarding",
    //     requiresOnboarding: true,
    //     userId: user._id
    //   });
    // }


    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id);


    const loggedInUser = await User.findById(user._id)
      .select("-password -refreshToken -otp -otpExpiry")
      .populate('profile');


    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // Don't set domain for cross-domain requests - browser will handle it
      // domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = getCookieOptions(req);
  options.maxAge = 0; // Immediate expiration

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json("User logged out");
};

////////////////////////////////////////////////////////////


// Helper function to get mobile-friendly cookie options
const getCookieOptions = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None for production, Lax for development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};





const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(404).json({ success: false, message: "Refresh token not found" });
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const accessToken = user.generateAccessToken();

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json({
        success: true,
        message: "Access token refreshed",
        accessToken
      });

  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      gender,
      height,
      currentWeight,
      goalWeight,
      foodAllergies,
      preferences
      // Accept onboarding related fields from settings page
      , age, medicalConditions, foodsToAvoid
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if username or email already exists (if changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (gender) user.gender = gender;
    if (height) user.height = height;
    if (currentWeight) user.currentWeight = currentWeight;
    if (goalWeight) user.goalWeight = goalWeight;
    // Merge and update allergies
    if (foodAllergies) {
      if (Array.isArray(foodAllergies)) {
        user.foodAllergies = foodAllergies;
      } else if (typeof foodAllergies === 'string') {
        // CSV string support
        user.foodAllergies = foodAllergies.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Merge new onboarding preference fields into user.preferences
    const existingPrefs = user.preferences?.toObject?.() || user.preferences || {};
    const incomingPrefs = preferences || {};

    const mergedPrefs = {
      ...existingPrefs,
      ...incomingPrefs,
      medicalConditions: medicalConditions || existingPrefs.medicalConditions,
      foodsToAvoid: foodsToAvoid || existingPrefs.foodsToAvoid,
    };

    // --- Sanitization: remove invalid enum values or empty strings that would fail Mongoose enum validation
    // Allowed meatPreference values in User model: ["Chicken","Pork","Beef","Fish","Bacon","No Meat"]
    const allowedMeat = ["Chicken", "Pork", "Beef", "Fish", "Bacon", "No Meat"];
    if (mergedPrefs.meatPreference) {
      // trim and normalize
      const mp = String(mergedPrefs.meatPreference).trim();
      if (!allowedMeat.includes(mp)) {
        // remove invalid value so schema default/previous value remains
        delete mergedPrefs.meatPreference;
      } else {
        mergedPrefs.meatPreference = mp;
      }
    }

    // Remove any top-level empty strings from preferences to avoid enum validation failures
    Object.keys(mergedPrefs).forEach((k) => {
      if (typeof mergedPrefs[k] === 'string' && mergedPrefs[k].trim() === '') {
        delete mergedPrefs[k];
      }
    });

    user.preferences = mergedPrefs;

    // If age or health fields provided, update or create HealthProfile
    if (age || height || currentWeight || goalWeight || gender) {
      try {
        let healthProfile = null;
        if (user.profile) {
          healthProfile = await HealthProfile.findById(user.profile);
        }

        if (healthProfile) {
          if (age) healthProfile.age = age;
          if (height) healthProfile.height = height;
          if (currentWeight) healthProfile.weight = currentWeight;
          if (gender) healthProfile.gender = gender;
          if (goalWeight) healthProfile.goals = goalWeight || healthProfile.goals;
          await healthProfile.save();
        } else {
          const newProfile = new HealthProfile({
            user: user._id,
            age,
            height,
            weight: currentWeight,
            gender,
            goals: goalWeight
          });
          await newProfile.save();
          user.profile = newProfile._id;
        }
      } catch (e) {
        console.warn('Failed to update health profile from settings:', e.message);
      }
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(user._id)
      .select("-password -refreshToken -otp -otpExpiry")
      .populate('profile');

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new passwords are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user first to check if exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Delete user's related data
    // Delete health profile if exists
    if (user.profile) {
      await HealthProfile.findByIdAndDelete(user.profile);
    }

    // You can add more related data deletion here (meal plans, etc.)

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    // Clear cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 0, // Immediate expiration
      path: "/",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "Account deleted successfully"
      });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const displayCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }
  return res
    .status(200)
    .json({
      success: true,
      message: "Current user fetched successfully",
      user: req.user
    });
};

// Get user profile with full details
const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const user = await User.findById(req.user._id)
      .select("-password -refreshToken -otp -otpExpiry")
      .populate('profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: user
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Request password reset: generate OTP and email to user
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.status(200).json({ success: true, message: "If an account exists for this email, an OTP has been sent" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const sent = await sendOTPEmail(user.email, otp);
    if (!sent) {
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({ success: true, message: "If an account exists for this email, an OTP has been sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Reset password using OTP
const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP or email" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    user.password = newPassword; // will be hashed in pre-save
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPasswordWithOTP:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// ------------------------
// CART CONTROLLERS
// ------------------------

// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.user._id;
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  res.json(cart);
};

// Add product to cart
export const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  // Update total
  await cart.populate("items.product");
  cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate("items.product");
  res.json(updatedCart);
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex === -1) return res.status(404).json({ error: "Item not in cart" });

  cart.items[itemIndex].quantity = Math.max(1, quantity);

  await cart.populate("items.product");
  cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate("items.product");
  res.json(updatedCart);
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);

  await cart.populate("items.product");
  cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate("items.product");
  res.json(updatedCart);
};

// ------------------------
// ORDER CONTROLLERS
// ------------------------

// Create order from cart
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
      price: i.product.price,
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: userId,
      items,
      total,
      shippingAddress,
      status: "pending",
    });

    // Clear user's cart
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({ success: true, message: "Order created", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id; // assuming auth middleware sets req.user
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name image") // populate only name and image
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export {
  register,
  verifyOTP,
  resendOTP,
  completeOnboarding,
  login,
  logout,
  refreshAccessToken,
  updateProfile,
  deleteUser,
  changePassword,
  // Password Reset
  requestPasswordReset,
  resetPasswordWithOTP,
  displayCurrentUser,
  getUserProfile,
};
