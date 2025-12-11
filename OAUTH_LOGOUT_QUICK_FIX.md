# ⚡ Quick Fix: Google OAuth Logout Issue

## Problem
Users logged out after 15 minutes when using Google login.

## Root Cause
- ❌ Missing JWT token secrets in `.env`
- ❌ No token expiry configuration
- ❌ No automatic token refresh
- ❌ Session cookies only lasted 24 hours

## Solution (5 Minutes)

### Step 1: Add JWT Secrets to `.env`

Run the setup script:
```bash
cd backend
./setup_oauth_fix.sh
```

OR manually add to `.env`:
```bash
# Generate secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env:
ACCESS_TOKEN_SECRET=<generated_secret_1>
REFRESH_TOKEN_SECRET=<generated_secret_2>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

### Step 2: Setup Frontend Auto-Refresh

Add to your main app file (`App.jsx` or `main.jsx`):

```javascript
import { setupAxiosInterceptors } from './utils/tokenManager';

// Add this line after imports
setupAxiosInterceptors();
```

### Step 3: Restart Backend

```bash
npm start
```

### Step 4: Test

1. Login with Google
2. Wait 15 minutes (or set `ACCESS_TOKEN_EXPIRY=1m` for faster testing)
3. Try using the app - should work without logout!

## What Changed

### Backend:
- ✅ Added JWT token configuration
- ✅ Session cookies now last 7 days
- ✅ Added `/oauth/refresh-token` endpoint
- ✅ Improved security (httpOnly, sameSite)

### Frontend:
- ✅ Created token manager utility (`utils/tokenManager.js`)
- ✅ Auto-refresh tokens before expiry
- ✅ Retry API calls on 401 errors
- ✅ Improved OAuth callback handling

## Result

- ✅ Users stay logged in for **7 days**
- ✅ Tokens auto-refresh every **15 minutes**
- ✅ No more unexpected logouts
- ✅ Seamless user experience

## Files Modified

### Backend:
1. `backend/.env.example` - Added JWT config
2. `backend/index.js` - Improved session cookies
3. `backend/src/routes/auth.routes.js` - Added refresh endpoint

### Frontend:
4. `frontend/src/utils/tokenManager.js` - NEW auto-refresh utility
5. `frontend/src/pages/OAuthCallback.jsx` - Improved handling

## Documentation

- **Full Guide:** `GOOGLE_OAUTH_SESSION_FIX.md`
- **Setup Script:** `backend/setup_oauth_fix.sh`

## Need Help?

1. Make sure all environment variables are set
2. Restart backend server
3. Clear browser localStorage and try fresh login
4. Check browser console for error messages

That's it! Your Google OAuth sessions should now work properly. 🎉
