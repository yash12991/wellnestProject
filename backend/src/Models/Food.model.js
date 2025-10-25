// backend/models/dietModels.js
const mongoose = require('mongoose');

// FoodItem
const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number },
  protein: { type: Number },
  carbohydrates: { type: Number },
  fat: { type: Number },
  fiber: { type: Number },
  sugar: { type: Number },
  sodium: { type: Number },
  vitaminA: { type: Number },
  vitaminC: { type: Number },
  calcium: { type: Number },
  iron: { type: Number },
  potassium: { type: Number },
  dietTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DietType' }],
});
const FoodItem = mongoose.model('FoodItem', foodItemSchema);

// MealPlan
const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietType: { type: mongoose.Schema.Types.ObjectId, ref: 'DietType' },
  duration: { type: Number }, // e.g., 7 days
  dailyCalories: { type: Number },
  days: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DayPlan' }],
  // generatedByAI: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

// DayPlan
const dayPlanSchema = new mongoose.Schema({
  mealPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan', required: true },
  dayNumber: { type: Number, required: true },
  meals: [{
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'MealType' },
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
    totalCalories: { type: Number },
  }],
});
const DayPlan = mongoose.model('DayPlan', dayPlanSchema);

module.exports = { FoodItem, MealPlan, DayPlan };
