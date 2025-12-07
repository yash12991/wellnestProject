# Log Meal Fix - Relative URL Issue

## The Problem
The "Log Meal" feature wasn't working because the frontend was making API calls using **relative URLs** like `/v1/api/mealplan/...` instead of the full `API_URL`.

When your frontend is on `www.wellnest.sbs` and tries to call `/v1/api/mealplan/...`, the browser sends the request to:
```
https://www.wellnest.sbs/v1/api/mealplan/... ❌ (WRONG - Vercel, no API)
```

Instead of:
```
https://api.wellnest.sbs/v1/api/mealplan/... ✓ (CORRECT - Render backend)
```

---

## What Was Fixed

### Files Updated:

#### 1. **frontend/src/pages/Dashboard/Dashboard.jsx**
Fixed 3 API calls:
- ✓ `handleLogMeal` - POST to complete meal
- ✓ `fetchDailyCalories` - GET daily calories  
- ✓ `fetchTodaysCompleted` - GET completed meals

**Before:**
```javascript
await axios.post(`/v1/api/mealplan/${userId}/meal/complete`, ...)
```

**After:**
```javascript
await axios.post(`${API_URL}/v1/api/mealplan/${userId}/meal/complete`, ...)
```

#### 2. **frontend/src/pages/Dashboard/Reports.jsx**
Fixed 4 API calls + added API_URL import:
- ✓ Added `import { API_URL } from "../../utils/api";`
- ✓ GET daily calories
- ✓ GET completed meals
- ✓ GET favourites  
- ✓ GET latest meal plan

#### 3. **frontend/src/components/MealPlanTable.jsx**
Fixed 4 API calls:
- ✓ `fetchCompletedMeals` - GET completed meals
- ✓ GET favourites (2 places)
- ✓ POST add favourite
- ✓ DELETE remove favourite

---

## How It Works Now

### 1. User Clicks "Log Meal" Button
Located in Dashboard at: Today's Meal Plan section

### 2. Frontend Calls Backend
```javascript
POST https://api.wellnest.sbs/v1/api/mealplan/{userId}/meal/complete
Headers: { Authorization: "Bearer <token>" }
Body: {
  day: "monday",
  mealType: "breakfast",
  dishName: "Oatmeal with fruits",
  calories: 350,
  protein: 12,
  carbs: 45,
  fats: 8
}
```

### 3. Backend Processes
- Validates user exists
- Adds to `user.completedMeals` array
- Updates `user.dailyCalories` for today
- Creates `MealAnalytics` record
- Returns success response

### 4. Frontend Updates UI
- Marks meal as completed (green highlight)
- Updates calorie counter
- Shows toast notification
- Dispatches `mealLogged` event for other components

---

## Deploy Steps

### 1. Frontend (Vercel) - Already pushed
Changes are in Git and will auto-deploy on Vercel:
- Wait 2-3 minutes for deployment
- Check deployment status at https://vercel.com/dashboard

### 2. Backend (Render) - Cookie fix already deployed
The cookie domain fix was already deployed earlier.

### 3. Set Environment Variable on Vercel (CRITICAL)
**You must do this for the fixes to work:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add/Update:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api.wellnest.sbs`
   - **Environments**: Production, Preview, Development
5. Click Save
6. **Redeploy** from Deployments tab

---

## Test After Deployment

1. **Clear Browser Data:**
   ```
   Press F12 → Application tab → Clear site data
   Or use Incognito mode
   ```

2. **Login:**
   - Go to `https://www.wellnest.sbs/login`
   - Login with your credentials

3. **Generate Meal Plan:**
   - Go to Dashboard
   - If no meal plan, click "Generate Meal Plan"

4. **Test Log Meal:**
   - In "Today's Meal Plan" section
   - Click "Log" button on any meal (Breakfast, Lunch, or Dinner)
   - Should see green checkmark and success toast
   - Calorie counter should update

5. **Verify in Browser DevTools:**
   - Press F12 → Network tab
   - Click "Log" on a meal
   - Look for request to `https://api.wellnest.sbs/v1/api/mealplan/.../meal/complete`
   - Status should be `200 OK`

---

## If It Still Doesn't Work

### Check API_URL is Set
Open browser console (F12) and look for:
```
[API] Resolved API_URL -> https://api.wellnest.sbs
```

If it shows `undefined` or `http://localhost:5000`:
- Environment variable not set on Vercel
- Or deployment didn't pick up the new variable

### Check Network Requests
1. F12 → Network tab
2. Click "Log Meal"
3. Look at the request URL
4. Should be: `https://api.wellnest.sbs/v1/api/mealplan/...`
5. If it shows `https://www.wellnest.sbs/v1/api/...` → Environment variable not set

### Check CORS
If you see CORS errors:
- Backend CORS already includes `www.wellnest.sbs`
- Make sure backend is deployed and running
- Check Render logs for errors

---

## Summary

✅ Fixed 11 API endpoints across 3 files  
✅ All API calls now use full `${API_URL}` instead of relative paths  
✅ Cookie domain issue already fixed earlier  
✅ Changes pushed to Git  

**Next step**: Set `VITE_API_URL=https://api.wellnest.sbs` on Vercel and redeploy!
