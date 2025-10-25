// Test script to check user context generation
import mongoose from 'mongoose';
import User from './src/Models/User.models.js';
import MealPlan from './src/Models/MealPlan.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function testUserContext() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📱 Connected to MongoDB');
    
    // Find a sample user
    const users = await User.find().limit(5);
    console.log('👥 Found users:', users.length);
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log('🧑 Test user:', {
        username: testUser.username,
        email: testUser.email,
        gender: testUser.gender,
        height: testUser.height,
        currentWeight: testUser.currentWeight,
        goalWeight: testUser.goalWeight,
        foodAllergies: testUser.foodAllergies,
        preferences: testUser.preferences
      });
      
      // Check meal plan
      const mealPlan = await MealPlan.findOne({ userId: testUser._id }).sort({ createdAt: -1 });
      console.log('🍽️ Meal plan exists:', !!mealPlan);
      
      if (mealPlan) {
        console.log('📅 Meal plan created:', mealPlan.createdAt);
        console.log('📋 Days in plan:', mealPlan.week.length);
      }
      
      // Generate user context like the API does
      const userContext = {
        personalInfo: {
          username: testUser.username,
          email: testUser.email,
          gender: testUser.gender,
          height: testUser.height,
          currentWeight: testUser.currentWeight,
          goalWeight: testUser.goalWeight,
          age: testUser.age,
          isOnboardingComplete: testUser.isOnboardingComplete
        },
        healthProfile: {
          foodAllergies: testUser.foodAllergies || [],
          preferences: testUser.preferences || {},
          role: testUser.role
        },
        currentMealPlan: mealPlan ? {
          createdAt: mealPlan.createdAt,
          weeklyPlan: mealPlan.week.map(day => ({
            day: day.day,
            breakfast: day.breakfast.dish,
            lunch: day.lunch.dish,
            dinner: day.dinner.dish,
            totalCalories: day.breakfast.calories + day.lunch.calories + day.dinner.calories
          }))
        } : null
      };
      
      console.log('🎯 Generated user context:', JSON.stringify(userContext, null, 2));
      
      // Generate system prompt
      let systemPrompt = `You are Aarav, a friendly and knowledgeable AI health assistant for WellNest. You are speaking with ${testUser.username || 'the user'}.

== USER PROFILE ==
Name: ${userContext.personalInfo.username}
Email: ${userContext.personalInfo.email}
Gender: ${userContext.personalInfo.gender || 'Not specified'}
Height: ${userContext.personalInfo.height ? `${userContext.personalInfo.height} cm` : 'Not specified'}
Current Weight: ${userContext.personalInfo.currentWeight ? `${userContext.personalInfo.currentWeight} kg` : 'Not specified'}
Goal Weight: ${userContext.personalInfo.goalWeight ? `${userContext.personalInfo.goalWeight} kg` : 'Not specified'}

== HEALTH PROFILE ==
Food Allergies: ${userContext.healthProfile.foodAllergies.length > 0 ? userContext.healthProfile.foodAllergies.join(', ') : 'None specified'}
Dietary Preferences: ${Object.keys(userContext.healthProfile.preferences).length > 0 ? JSON.stringify(userContext.healthProfile.preferences) : 'None specified'}
User Role: ${userContext.healthProfile.role}`;

      if (userContext.currentMealPlan) {
        systemPrompt += `\n\n== CURRENT MEAL PLAN ==
Created: ${new Date(userContext.currentMealPlan.createdAt).toLocaleDateString()}
Weekly Plan:`;
        
        userContext.currentMealPlan.weeklyPlan.forEach(day => {
          systemPrompt += `\n${day.day.charAt(0).toUpperCase() + day.day.slice(1)}:
  • Breakfast: ${day.breakfast} 
  • Lunch: ${day.lunch}
  • Dinner: ${day.dinner}
  • Total Calories: ${day.totalCalories}`;
        });
      } else {
        systemPrompt += `\n\n== CURRENT MEAL PLAN ==
No meal plan currently active. User may need help creating one.`;
      }
      
      console.log('\n🔥 GENERATED SYSTEM PROMPT:');
      console.log('='.repeat(80));
      console.log(systemPrompt);
      console.log('='.repeat(80));
      
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testUserContext();