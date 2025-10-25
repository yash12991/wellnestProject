// backend/models/userModels.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ================================
// User Schema
// ================================
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "dietician", "admin"],
    default: "user",
    required: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HealthProfile",
  },

  // Basic Health Details
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other",
  },
  height: { type: Number }, // cm
  currentWeight: { type: Number }, // kg
  goalWeight: { type: Number }, // kg

  // Account & Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  isOnboardingComplete: {
    type: Boolean,
    default: false,
  },

  // Cart Reference
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    }
  ],


  // Allergies & Health
  foodAllergies: [{ type: String }], // List of user's food allergies

  // --- NEW FIELDS FROM ONBOARDING ---
  preferences: {
    meatPreference: {
      type: String,
      enum: ["Chicken", "Pork", "Beef", "Fish", "Bacon", "No Meat"],
    },
    activityLevel: {
      type: String,
      enum: ["Inactive", "Light", "Moderate", "Heavy"],
    },
    fatigueTime: {
      type: String,
      enum: ["Early Morning", "After Lunch", "After Dinner", "Not Until Bed Time"],
    },
    digestiveUpset: {
      type: String,
      enum: ["Never", "A couple times per month", "Twice a week or more", "Daily"],
    },
    cravingsFrequency: {
      type: String,
      enum: ["Once a month or less", "On a weekly basis", "A few times per week", "Daily"],
    },
    cravingType: {
      type: String,
      enum: ["Carbs", "Sweets", "Red Meat", "No Cravings"],
    },
    goals: {
      type: String,
      enum: [
        "More energy",
        "Better sleep",
        "Weight gain",
        "Weight loss",
        "Become lean and toned",
        "Improve digestion",
        "Improve metabolism",
      ],
    },
    otherPreferences: { type: String }, // free text preferences

    // NEW ADDITIONS
    medicalConditions: { type: String }, // allergic, diabetic, etc.
    foodsToAvoid: { type: String }, // e.g., fried foods, gluten
  },
    // Track completed meals and daily calories for logging & analytics
    completedMeals: [
      {
        day: { type: String },
        mealType: { type: String },
        dishName: { type: String },
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    dailyCalories: [
      {
        date: { type: String },
        totalCalories: { type: Number, default: 0 }
      }
    ],
});

// ================================
// Password Hashing Middleware
// ================================
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// ================================
// Instance Methods
// ================================
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

// ================================
// Export Models
// ================================
export const User = mongoose.model("User", userSchema);

// ================================
// Dietician Schema
// ================================
const dieticianSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  credentials: { type: String }, // e.g., certifications
  specialization: { type: String }, // e.g., 'Sports Nutrition'
  availability: [{ day: String, timeSlots: [String] }],
});
export const Dietician = mongoose.model("Dietician", dieticianSchema);

// ================================
// Authentication Schema
// ================================
const authenticationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  refreshToken: { type: String },
  expiresAt: { type: Date },
});
export const Authentication = mongoose.model("Authentication", authenticationSchema);
