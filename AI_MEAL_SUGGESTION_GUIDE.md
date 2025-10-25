# AI Meal Suggestion Feature - Usage Guide

## Overview
The new AI meal suggestion feature allows users to get personalized meal recommendations and replace meals in their meal plan using AI suggestions based on their onboarding preferences.

## How It Works

### Backend
- **Endpoint**: `POST /v1/api/chat/meal/ai-update`
- **Authentication**: Requires JWT token
- **Smart Context**: Uses user's onboarding data (allergies, preferences, activity level, etc.)

### Frontend Integration
- **Location**: MealPlanTable component
- **Trigger**: Purple sparkles (✨) button on each meal card
- **Modal**: Compare & Apply Modal shows original vs AI suggestions

## User Journey

1. **View Meal Plan**: User sees their weekly meal plan with meals
2. **Click AI Suggest**: Purple sparkles button opens the Compare & Apply Modal
3. **Compare Options**: Left column shows current meal, right shows AI suggestion
4. **Customize Request**: Optional instruction field (e.g., "make it vegan", "more protein")
5. **Choose Suggestion**: Select from 3 AI-generated alternatives
6. **Safety Check**: Red warning if suggestion contains user's allergies
7. **Apply Changes**: One-click apply with undo option (10 seconds)

## Features

### Safety & Personalization
- ✅ **Allergy Detection**: Warns if suggestion contains user's known allergies
- ✅ **Preference Aware**: Uses onboarding data (meat preference, activity level, dietary goals)
- ✅ **Nutritional Balance**: Maintains similar calorie ranges
- ⚠️ **Conflict Prevention**: Blocks applying meals with allergen conflicts

### UX Enhancements
- **Compare View**: Side-by-side original vs suggestion
- **Quick Actions**: Request variation, save as favorite
- **Undo Support**: 10-second undo window after applying changes
- **Success Feedback**: Clear confirmation with undo option
- **Loading States**: Smooth loading indicators

### Customization Options
- **Custom Instructions**: "Make it spicier", "Add more protein", "Make it vegan"
- **Request Variations**: One-click to get different style suggestions
- **Multiple Options**: Choose from 3 AI-generated alternatives
- **Difficulty Levels**: Easy/Medium/Hard suggestions

## API Usage Examples

### Get Suggestions Only
```javascript
POST /v1/api/chat/meal/ai-update
Authorization: Bearer <token>
{
  "dayOfWeek": "Monday",
  "mealType": "dinner",
  "instruction": "Make it vegetarian and high-protein",
  "autoConfirm": false
}
```

### Apply Suggestion Directly
```javascript
POST /v1/api/chat/meal/ai-update
Authorization: Bearer <token>
{
  "dayOfWeek": "Monday", 
  "mealType": "dinner",
  "instruction": "Apply selected replacement",
  "autoConfirm": true,
  "selectedReplacementIndex": 1
}
```

## Response Format

### Suggestions Response
```json
{
  "success": true,
  "message": "Replacement suggestions generated",
  "suggestions": {
    "replacements": [
      {
        "name": "Grilled Tofu with Quinoa",
        "description": "High-protein vegetarian meal...",
        "calories": 450,
        "prepTime": "25 min",
        "difficulty": "easy",
        "ingredients": ["tofu", "quinoa", "vegetables"],
        "whyGoodReplacement": "Matches your protein goals and dietary preferences"
      }
    ],
    "smartSubstitutions": [...],
    "personalizedTips": [...]
  }
}
```

### Apply Response
```json
{
  "success": true,
  "message": "Replaced dinner for Monday",
  "data": {
    "updatedMeal": {...},
    "originalMeal": {...},
    "verifiedUpdate": {...}
  }
}
```

## Technical Implementation

### Files Modified
- `backend/src/controllers/chat.controllers.js` - Added `aiUpdateMeal` function
- `backend/src/routes/chat_routes.js` - Added `/meal/ai-update` route
- `frontend/src/components/CompareApplyModal.jsx` - New modal component
- `frontend/src/components/MealPlanTable.jsx` - Added AI suggest buttons and modal integration

### Key Components
1. **CompareApplyModal**: Main UI component for meal comparison and application
2. **aiUpdateMeal**: Backend controller handling AI suggestions and meal replacement
3. **Smart Integration**: Uses existing SmartMealReplacementService for AI logic

## Testing

### Manual Testing Steps
1. Complete user onboarding with preferences and allergies
2. Generate a meal plan
3. Click purple sparkles button on any meal
4. Verify modal opens with current meal shown
5. Check that AI suggestions respect user allergies (red warning if conflict)
6. Apply a suggestion and verify meal plan updates
7. Test undo functionality within 10 seconds

### Edge Cases
- No meal plan exists
- User has no allergies/preferences set
- AI service is unavailable
- Network errors during suggestion fetch
- Applying meal with allergy conflicts (should be blocked)

## Future Enhancements
- Save suggestions as permanent favorites
- Bulk AI optimize entire week
- Learn from user's apply/reject patterns
- Integration with grocery list generation
- Nutrition goal optimization (macro targets)