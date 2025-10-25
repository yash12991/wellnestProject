import express from 'express';
import MealPlan from '../Models/MealPlan.model.js';
import { User } from '../Models/User.models.js';
import MealAnalytics from '../Models/MealAnalytics.model.js';
import { sendMealPlanEmail } from '../config/email.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Save a meal plan for a user
router.post('/save', async (req, res) => {
  try {
    const { userId, week } = req.body;
    if (!userId || !week) return res.status(400).json({ message: 'userId and week are required' });
    const mealPlan = new MealPlan({ userId, week });
    await mealPlan.save();
    res.status(201).json({ message: 'Meal plan saved', mealPlan });
  } catch (err) {
    res.status(500).json({ message: 'Error saving meal plan', error: err.message });
  }
});

// Get the latest meal plan for a user
router.get('/latest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
    if (!mealPlan) return res.status(404).json({ message: 'No meal plan found' });
    res.json(mealPlan);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meal plan', error: err.message });
  }
});

// Email meal plan to user
router.post('/email', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get latest meal plan
    const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 });
    if (!mealPlan) {
      return res.status(404).json({ message: 'No meal plan found for this user' });
    }

    // Send email
    const emailSent = await sendMealPlanEmail(user.email, user.username, mealPlan.week);
    
    if (emailSent) {
      res.json({ 
        message: 'Meal plan sent to your email successfully!',
        email: user.email
      });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (err) {
    console.error('Email meal plan error:', err);
    res.status(500).json({ message: 'Error sending meal plan email', error: err.message });
  }
});
// Mark a meal as complete and update daily calories 
router.post("/:userId/meal/complete", async (req, res) => {
  try {
    const { userId } = req.params;
    const { day, mealType, dishName, calories , protein, carbs, fats } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure arrays exist to avoid runtime errors
    if (!Array.isArray(user.completedMeals)) user.completedMeals = [];
    if (!Array.isArray(user.dailyCalories)) user.dailyCalories = [];

    // Check if this meal is already marked complete
    const alreadyCompleted = user.completedMeals.some(
      (m) => m.day === day && m.mealType === mealType
    );
    if (alreadyCompleted) {
      return res.status(200).json({ success: true, message: "Meal already marked complete" });
    }

    // ✅ Step 1: Add to completedMeals
    // Coerce numeric values and provide defaults
    const numericCalories = Number(calories) || 0;
    const numericProtein = Number(protein) || 0;
    const numericCarbs = Number(carbs) || 0;
    const numericFats = Number(fats) || 0;

    user.completedMeals.push({
      day,
      mealType,
      dishName,
      calories: numericCalories,
      protein: numericProtein,
      carbs: numericCarbs,
      fats: numericFats,
    });

    // ✅ Step 2: Update today's total calories (PASTE YOUR SNIPPET HERE)
    const today = new Date().toISOString().split("T")[0];
    const dayEntry = user.dailyCalories.find((d) => d.date === today);
    if (dayEntry) {
      dayEntry.totalCalories += numericCalories;
    } else {
      user.dailyCalories.push({ date: today, totalCalories: numericCalories });
    }

    // ✅ Step 3: Save user
    await user.save();

    // ✅ Step 4: Create analytics record for reporting
    try {
      await MealAnalytics.create({
        userId: user._id,
        day,
        mealType,
        dishName,
        calories: numericCalories,
        protein: numericProtein,
        carbs: numericCarbs,
        fats: numericFats,
        source: 'user_log',
      });
    } catch (analyticsErr) {
      console.error('Failed to create meal analytics record:', analyticsErr);
      // don't fail the user flow for analytics write error
    }

    res.status(200).json({
      success: true,
      message: "Meal marked as complete",
      totalCompleted: user.completedMeals.length,
    });
  } catch (err) {
    console.error("Meal complete error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to mark meal complete",
      error: err.message,
    });
  }
});
router.get('/:userId/completed-meals', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ completedMeals: user.completedMeals });
  } catch (error) {
    console.error("Error fetching completed meals:", error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:userId/dailyCalories', verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ dailyCalories: user.dailyCalories || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching daily calories', error: err.message });
  }
});

// Get meal analytics/log history for a user
router.get('/:userId/meal-analytics', verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { limit = 6, page = 1, recent = false } = req.query;
  
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { userId };
    
    // If recent=true, only get logs from today and yesterday
    if (recent === 'true') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Set time to start of day for accurate comparison
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      query.createdAt = {
        $gte: yesterdayStart
      };
    }
    
    const analytics = await MealAnalytics.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await MealAnalytics.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: analytics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching meal analytics:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching meal analytics', 
      error: error.message 
    });
  }
});

export default router;


