# AI Meal Suggestions - Onboarding Preferences Integration Fix

## Problem
The AI meal suggestion system was not using the detailed user onboarding preferences when generating meal replacements. It was only using basic information like weight goals and allergies, missing crucial data like:
- Activity level preferences
- Meat preferences  
- Specific health goals (energy, digestion, etc.)
- Craving patterns
- Digestive issues
- Medical conditions
- Foods to avoid
- Physical characteristics (height, weight, age, gender)

## Root Cause
The `userContext` object being passed to the AI service contained hardcoded values instead of using the detailed onboarding data stored in the User model's `preferences` field.

## Files Fixed

### 1. `/backend/src/controllers/chat.controllers.js`
**Changes Made:**
- Added `buildUserContext(user)` helper function that extracts all onboarding preferences
- Replaced 6 instances of hardcoded `userContext` objects with calls to the helper function
- Now includes comprehensive user profile data:
  - Basic health info (goals, restrictions, allergies)
  - Detailed preferences (activity level, meat preference, health goals)
  - Craving patterns and digestive issues
  - Medical conditions and foods to avoid
  - Physical characteristics (age, gender, height, weight)

**Functions Updated:**
- `generateAIResponse()` - 2 instances
- `aiUpdateMeal()` - 1 instance  
- `requestMealReplacement()` - 1 instance
- `confirmMealReplacement()` - 1 instance
- `modifyMeal()` - 1 instance

### 2. `/backend/src/services/smartMealReplacement.service.js`
**Changes Made:**
- Enhanced AI prompt in `suggestMealReplacement()` to include all onboarding preferences
- Updated requirements section to prioritize user's detailed health goals
- Now AI considers:
  - Specific health goals (weight loss/gain, energy, digestion)
  - Activity level for appropriate portions
  - Meat preferences and dietary restrictions
  - Medical conditions and digestive issues
  - Craving patterns and energy fatigue times
  - Physical characteristics for personalized nutrition

## User Onboarding Data Now Used

### From `user.preferences`:
- `activityLevel`: Inactive, Light, Moderate, Heavy
- `meatPreference`: Chicken, Pork, Beef, Fish, Bacon, No Meat
- `goals`: More energy, Better sleep, Weight gain/loss, etc.
- `cravingType`: Carbs, Sweets, Red Meat, No Cravings
- `cravingsFrequency`: Daily, weekly, monthly patterns
- `digestiveUpset`: Frequency of digestive issues
- `fatigueTime`: When user experiences energy drops
- `medicalConditions`: Allergic, diabetic, etc.
- `foodsToAvoid`: Specific foods to exclude
- `otherPreferences`: Free text preferences

### From user profile:
- `gender`, `height`, `currentWeight`, `goalWeight`, `age`
- `foodAllergies`: Array of allergic foods

## Impact
Now when users request AI meal suggestions, the system will:
1. **Respect all dietary restrictions** including medical conditions
2. **Match activity level** with appropriate calories and macros
3. **Consider craving patterns** to suggest satisfying alternatives
4. **Account for digestive issues** when recommending ingredients
5. **Align with specific health goals** (energy, sleep, weight management)
6. **Use meat preferences** to suggest appropriate protein sources
7. **Avoid problematic foods** based on user's specified foods to avoid
8. **Personalize based on physical characteristics** for optimal nutrition

## Testing
✅ Both controller and service files load without syntax errors
✅ All 6 instances of userContext updated to use comprehensive data
✅ AI prompts enhanced to utilize detailed onboarding information

## Example Before vs After

**Before:**
```javascript
const userContext = {
  healthGoals: 'Weight management',
  restrictions: ['peanuts'],
  activityLevel: 'Moderate', // hardcoded
  budget: 'Moderate' // hardcoded
};
```

**After:**
```javascript
const userContext = buildUserContext(user);
// Includes: activityLevel: 'Heavy', meatPreference: 'No Meat', 
// goals: 'More energy', digestiveUpset: 'Daily', etc.
```

The AI now receives complete user profile data and can make much more personalized meal suggestions that truly match the user's onboarding preferences!