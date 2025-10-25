# Fix: MealPlan Validation Error - Missing Tags Field

## Issue
The AI meal replacement feature was failing with a validation error:
```
MealPlan validation failed: week.0.breakfast.tags: Path `breakfast.tags` is required.
```

## Root Cause
The `MealPlan` schema requires a `tags` field for each meal (breakfast, lunch, dinner), but the `replaceMealInPlan` function in `smartMealReplacement.service.js` was not including this field when creating the `mealUpdate` object.

## Solution
Added a `generateMealTags` function that automatically generates appropriate tags based on:
- **Meal type**: breakfast, lunch, dinner
- **Difficulty level**: easy, medium, hard
- **Dietary preferences**: vegan, vegetarian, high-protein, low-carb
- **Health attributes**: healthy, quick
- **Meal characteristics**: based on ingredients and description

## Code Changes
**File**: `backend/src/services/smartMealReplacement.service.js`

### Before:
```javascript
const mealUpdate = {
  dish: newMeal.name,
  calories: newMeal.calories,
  recipe: recipeText
};
```

### After:
```javascript
const mealUpdate = {
  dish: newMeal.name,
  calories: newMeal.calories,
  recipe: recipeText,
  tags: generateMealTags(newMeal, mealType)
};
```

## Tag Generation Logic
The `generateMealTags` function analyzes meal properties and generates relevant tags:

1. **Always includes meal type** (breakfast/lunch/dinner)
2. **Difficulty level** from meal data or defaults to 'easy'
3. **Dietary tags** based on text analysis:
   - 'vegan' if no animal products detected
   - 'vegetarian' if no meat/fish detected
   - 'high-protein' if protein mentioned
   - 'low-carb' if low-carb/keto mentioned
4. **Health attributes**:
   - 'healthy' for low-calorie meals (<400 cal)
   - 'quick' for fast prep time (≤20 min)

## Testing
- ✅ Backend service loads without syntax errors
- ✅ Chat controller integrates properly
- ✅ Tags field requirement satisfied for MealPlan schema

## Impact
- Fixes the validation error preventing AI meal replacements
- Enhances meal data with meaningful tags for better categorization
- Maintains schema compliance across all meal updates
- Enables tag-based filtering and search in the future

## Example Generated Tags
- **"Scrambled Eggs with Spinach"** → `["breakfast", "easy", "vegetarian", "high-protein", "healthy"]`
- **"Quick Chicken Stir Fry"** → `["dinner", "easy", "high-protein", "quick"]`
- **"Vegan Buddha Bowl"** → `["lunch", "easy", "vegan", "healthy"]`