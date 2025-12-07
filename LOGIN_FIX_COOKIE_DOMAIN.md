# Login Issue Fix - Cookie Domain Problem

## The Problem
Login wasn't working because the backend was setting cookies with `domain: .onrender.com`, but your frontend is on `www.wellnest.sbs`. Browsers reject cookies when the domain doesn't match, preventing authentication.

## What Was Fixed

### 1. Backend Cookie Configuration
**File**: `backend/src/controllers/users.controllers.js`

Removed the hardcoded `.onrender.com` domain from cookie options in:
- `login` function (line ~550)
- `completeOnboarding` function (line ~449)

**Before:**
```javascript
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined, // ❌ WRONG
  path: "/",
};
```

**After:**
```javascript
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // Don't set domain for cross-domain requests - browser will handle it
  path: "/",
};
```

When you don't specify a domain, the browser automatically sets it to the domain that sent the cookie (in this case, `api.wellnest.sbs`), and the frontend can read the token from the response JSON.

---

## How to Deploy the Fix

### Step 1: Push Backend Changes to Render
```bash
cd /home/yashprashantsonawane/Videos/we/wellnestProject
git add .
git commit -m "Fix: Remove hardcoded cookie domain for cross-domain auth"
git push
```

Render will automatically redeploy your backend.

### Step 2: Set Frontend Environment Variable on Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api.wellnest.sbs`
   - **Environment**: Production, Preview, Development
5. Click **Save**
6. Go to **Deployments** tab → Click **⋯** on latest deployment → **Redeploy**

---

## Why This Happened

Your frontend uses `localStorage` to store tokens (which is the correct approach for cross-domain setups), but the backend was also trying to set cookies with a domain that didn't match your actual domain structure:

- Frontend: `www.wellnest.sbs` (Vercel)
- Backend: `api.wellnest.sbs` (Render)
- Old cookie domain: `.onrender.com` ❌

The browser rejected these cookies because `www.wellnest.sbs` is not under the `.onrender.com` domain.

---

## How Login Works Now

1. User submits email/password
2. Backend validates credentials
3. Backend generates tokens
4. Backend sends tokens in **response JSON** (not cookies for cross-domain)
5. Frontend saves tokens to `localStorage`:
   ```javascript
   localStorage.setItem("accessToken", response.data.accessToken);
   localStorage.setItem("refreshToken", response.data.refreshToken);
   localStorage.setItem("user", JSON.stringify(user));
   ```
6. Frontend includes token in subsequent requests via headers:
   ```javascript
   Authorization: `Bearer ${localStorage.getItem("accessToken")}`
   ```

This is the standard approach for cross-domain authentication (frontend and backend on different domains).

---

## Test After Deployment

1. Clear browser cache and localStorage:
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   ```

2. Go to `https://www.wellnest.sbs/login`

3. Try logging in with valid credentials

4. Check browser console for:
   - ✓ No CORS errors
   - ✓ Login request to `https://api.wellnest.sbs/v1/api/auth/login`
   - ✓ Response with `accessToken` and `refreshToken`
   - ✓ Redirect to dashboard or onboarding

5. Verify localStorage has tokens:
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('accessToken'));
   console.log(localStorage.getItem('user'));
   ```

---

## If Login Still Doesn't Work

### Check CORS Configuration
The backend CORS should already include your domain (already updated earlier):
```javascript
origin: [
  'https://www.wellnest.sbs',
  'https://wellnest.sbs',
  // ... other domains
]
```

### Check API URL
Open browser console and look for:
```
[API] Resolved API_URL -> https://api.wellnest.sbs
```

If it shows `http://localhost:5000` or `undefined`, the environment variable isn't set on Vercel.

### Check Network Tab
1. Open DevTools (F12) → Network tab
2. Try logging in
3. Click on the `login` request
4. Check:
   - Request URL: Should be `https://api.wellnest.sbs/v1/api/auth/login`
   - Status: Should be `200 OK`
   - Response: Should contain `accessToken`, `refreshToken`, and `user`

---

## Summary

✅ Removed hardcoded `.onrender.com` cookie domain  
✅ Created `.env.example` for Vercel configuration  
✅ Login now uses localStorage for tokens (standard for cross-domain)  
✅ Cookies no longer cause domain mismatch issues  

**Next steps**: Push changes and redeploy both backend (Render) and frontend (Vercel).
