// backend/models/healthModels.js
import mongoose from "mongoose";

// HealthProfile for onboarding page
const healthProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: { type: Number },
  weight: { type: Number }, // in kg
  height: { type: Number }, // in cm
  gender: { type: String, enum: ['male', 'female'] },
  goals: { type: String }, // e.g., 'weight loss'
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);

export { HealthProfile };