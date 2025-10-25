import mongoose from 'mongoose';

const mealAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String }, // weekday name or ISO date depending on usage
  mealType: { type: String },
  dishName: { type: String },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  source: { type: String, default: 'user_log' }, // e.g., 'user_log' or 'auto' or 'ai_replacement'
  createdAt: { type: Date, default: Date.now }
});

const MealAnalytics = mongoose.model('MealAnalytics', mealAnalyticsSchema);
export default MealAnalytics;
