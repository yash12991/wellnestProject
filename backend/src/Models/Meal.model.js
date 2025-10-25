// backend/models/generalModels.js
import mongoose from "mongoose";

// MealTypes
const mealTypesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Breakfast', 'Lunch'
  description: { type: String },
});
const MealType = mongoose.model('MealType', mealTypesSchema);

// DietTypes
const dietTypesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Vegan', 'Keto'
  description: { type: String },
});
const DietType = mongoose.model('DietType', dietTypesSchema);

module.exports = { MealType, DietType };