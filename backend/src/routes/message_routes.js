import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { User } from "../Models/User.models.js";
import MealPlan from "../Models/MealPlan.model.js";

dotenv.config();

const router = express.Router();
const aiKey = process.env.GOOGLE_API_KEY;
const ai = aiKey ? new GoogleGenerativeAI(aiKey) : null;

// Helper: safe JSON parse
const tryParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (_) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("Invalid AI JSON");
  }
};

// Helper: ensure every meal has dish + calories + recipe + macros + tags
const fillMissingMeals = (week) => {
  return week.map((day) => {
    ["breakfast", "lunch", "dinner"].forEach((meal) => {
      if (!day[meal]) day[meal] = {};
      if (!day[meal].dish) {
        day[meal].dish = "Generic Indian meal (dish missing)";
      }
      if (typeof day[meal].calories !== "number") {
        day[meal].calories = 0;
      }
      if (!day[meal].recipe) {
        day[meal].recipe = "Recipe not available";
      }
      if (typeof day[meal].protein !== "number") {
        day[meal].protein = 0;
      }
      if (typeof day[meal].fats !== "number") {
        day[meal].fats = 0;
      }
      if (typeof day[meal].carbs !== "number") {
        day[meal].carbs = 0;
      }
      if (!Array.isArray(day[meal].tags)) {
        day[meal].tags = ["general"];
      }
    });
    return day;
  });
};

router.get("/mealplan/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("profile");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = user.profile;

    // If AI key missing → serve fallback
    if (!ai) {
      return res.status(200).json({
        success: true,
        message: "Fallback plan (AI key not configured)",
        plan: [],
      });
    }

    // Build comprehensive user context from onboarding data
    const userContext = {
      // Basic info
      age: user.age || profile?.age || "Not specified",
      gender: user.gender || "Not specified",
      height: user.height || "Not specified",
      currentWeight: user.currentWeight || "Not specified",
      goalWeight: user.goalWeight || "Not specified",

      // Detailed onboarding preferences
      activityLevel: user.preferences?.activityLevel || "Moderate",
      meatPreference: user.preferences?.meatPreference || "Any",
      proteinVariety: user.preferences?.proteinVariety || user.preferences?.meatPreference || "Any",
      specificDayPreferences: user.preferences?.specificDayPreferences || "None",
      goals: user.preferences?.goals || profile?.goals || "General wellness",
      cravingType: user.preferences?.cravingType || "None",
      cravingsFrequency: user.preferences?.cravingsFrequency || "Rarely",
      digestiveUpset: user.preferences?.digestiveUpset || "Never",
      fatigueTime: user.preferences?.fatigueTime || "Not specified",
      medicalConditions: user.preferences?.medicalConditions || profile?.medicalHistory || "None",
      foodsToAvoid: user.preferences?.foodsToAvoid || "None",
      otherPreferences: user.preferences?.otherPreferences || "None",

      // Allergies and restrictions
      allergies: user.foodAllergies || [],

      // Additional preferences
      additionalPrefs: user.preferences
        ? Object.entries(user.preferences)
            .filter(
              ([key]) =>
                ![
                  "activityLevel",
                  "meatPreference",
                  "goals",
                  "cravingType",
                  "cravingsFrequency",
                  "digestiveUpset",
                  "fatigueTime",
                  "medicalConditions",
                  "foodsToAvoid",
                  "otherPreferences",
                ].includes(key),
            )
            .map(([key, value]) => (Array.isArray(value) ? `${key}: ${value.join(", ")}` : `${key}: ${value}`))
            .join("; ")
        : "None",
    };

    // Prompt
    const generatePayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a personalized 7-day Indian meal plan using comprehensive user profile:

BASIC PROFILE:
- Age: ${userContext.age}
- Gender: ${userContext.gender}
- Height: ${userContext.height} cm
- Current Weight: ${userContext.currentWeight} kg
- Goal Weight: ${userContext.goalWeight} kg

DETAILED HEALTH & LIFESTYLE PREFERENCES:
- Activity Level: ${userContext.activityLevel}
- Protein Sources Available: ${Array.isArray(userContext.proteinVariety) ? userContext.proteinVariety.join(", ") : userContext.proteinVariety}
- Day-Specific Protein Preferences: ${userContext.specificDayPreferences}
- Primary Health Goals: ${userContext.goals}
- Craving Type: ${userContext.cravingType}
- Craving Frequency: ${userContext.cravingsFrequency}
- Digestive Issues: ${userContext.digestiveUpset}
- Low Energy Time: ${userContext.fatigueTime}
- Medical Conditions: ${userContext.medicalConditions}
- Foods to Avoid: ${userContext.foodsToAvoid}
- Other Preferences: ${userContext.otherPreferences}
- Additional Preferences: ${userContext.additionalPrefs}

RESTRICTIONS & ALLERGIES:
- Food Allergies: ${userContext.allergies.join(", ") || "none"}

PERSONALIZATION REQUIREMENTS:
1. PROTEIN VARIETY: Use proteins from the available list: ${Array.isArray(userContext.proteinVariety) ? userContext.proteinVariety.join(", ") : userContext.proteinVariety}
2. DAY-SPECIFIC RULES: ${userContext.specificDayPreferences !== "None" ? `STRICTLY follow these day-specific preferences: ${userContext.specificDayPreferences}` : "Rotate proteins throughout the week for variety"}
3. VARIETY IS KEY: DO NOT repeat the same protein source on consecutive days unless specifically requested
4. Align with activity level - Higher calories and protein for "Heavy" activity, moderate for "Light"
5. Target specific health goals - energy-boosting foods for "More energy", digestive-friendly for digestion goals
6. Consider craving patterns - if user craves sweets/carbs, include healthier alternatives
7. Account for digestive issues - avoid spicy/heavy foods if user has frequent digestive upset
8. Time energy dips - provide energy-boosting meals before user's fatigue time
9. Respect medical conditions - diabetic-friendly if diabetic, heart-healthy if cardiac issues
10. NEVER include foods from "Foods to Avoid" list
11. STRICTLY avoid all listed allergies
12. Consider additional preferences for meal variety and satisfaction
13. IMPORTANT: Create VARIETY and DIFFERENT meals each time - avoid repeating the same dishes
14. Use diverse Indian regional cuisines and cooking methods for maximum variety

TECHNICAL REQUIREMENTS:
1. Output STRICT JSON with structure:
   {
     week: [
       {
         day: "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday",
         breakfast: { dish: string, calories: integer, protein: integer, fats: integer, carbs: integer, recipe: string , tags: [string] },
         lunch: { dish: string, calories: integer, protein: integer, fats: integer, carbs: integer, recipe: string, tags: [string] },
         dinner: { dish: string, calories: integer, protein: integer, fats: integer, carbs: integer, recipe: string, tags: [string] }
       }
     ]
   }
2. Every meal MUST include "dish", "calories", "protein", "fats", "carbs", "recipe", and "tags"
3. Recipe should be detailed step-by-step preparation guide
4. Calories, protein, fats, and carbs must be realistic integers appropriate for user's goals and activity level
5. Each "tags" field should have 3-5 descriptive labels matching user preferences
6. Use authentic Indian meals that match user's regional/cultural preferences
7. Ensure nutritional balance appropriate for user's health goals and restrictions
8. Return ONLY the JSON object, no markdown, no extra text`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    };

    // Call Gemini
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(generatePayload);
    const aiText = await result.response.text();

    // Parse JSON
    let data = tryParse(aiText);

    // Fix missing fields if needed
    data.week = fillMissingMeals(data.week);

    // Clear completed meals for the user when generating new meal plan
    await User.findByIdAndUpdate(userId, {
      $set: { completedMeals: [] },
    });

    // Create a new meal plan (don't update existing one to ensure fresh generation)
    const mealPlan = new MealPlan({
      userId,
      week: data.week,
    });
    await mealPlan.save();

    res.status(200).json({
      success: true,
      message: "Meal plan with recipes generated & saved",
      week: data.week,
      mealPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Meal plan generation failed",
      error: error.message,
    });
  }
});

export default router;
