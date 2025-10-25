import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  day: { type: String, required: true, lowercase: true, enum: [
    "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
  ]},
  breakfast: {
    dish: { type: String, required: true },
    calories: { type: Number, required: true, min: 0 },
 
    protein: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
 
    recipe: { type: String, required: true },
    tags: { type: [String], required: true },
  },
  lunch: {
    dish: { type: String, required: true },
    calories: { type: Number, required: true, min: 0 },
 
    protein: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
 
    recipe: { type: String, required: true },
    tags: { type: [String], required: true },
  },
  dinner: {
    dish: { type: String, required: true },
    calories: { type: Number, required: true, min: 0 },
 
    protein: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
 
    recipe: { type: String, required: true },
    tags: { type: [String], required: true },
  },
});

const mealPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    week: { type: [mealSchema], required: true },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;
