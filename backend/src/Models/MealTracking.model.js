import mongoose from "mongoose";

const mealTrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  meals: {
    breakfast: {
      dish: String,
      calories: Number,
      consumed: { type: Boolean, default: false },
    },
    lunch: {
      dish: String,
      calories: Number,
      consumed: { type: Boolean, default: false },
    },
    dinner: {
      dish: String,
      calories: Number,
      consumed: { type: Boolean, default: false },
    },
  },
  totalCaloriesConsumed: { type: Number, default: 0 },
});

const MealTracking = mongoose.model("MealTracking", mealTrackingSchema);
export default MealTracking;
