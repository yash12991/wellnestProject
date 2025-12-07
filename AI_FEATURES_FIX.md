# AI Features Not Working - Fix Guide

## Issues Found:

1. **Frontend URL mismatch in `.env`**
   - Current: `FRONTEND_URL=https://wellnest-project.vercel.app`
   - Should be: `FRONTEND_URL=https://www.wellnest.sbs`

2. **Google OAuth Callback URL mismatch**
   - Current: `GOOGLE_CALLBACK_URL=https://wellnestproject.onrender.com/v1/api/oauth/google/callback`
   - Should use your custom domain: `https://api.wellnest.sbs/v1/api/oauth/google/callback`

3. **Environment variables not synced to Render**
   - Your local `.env` file has the keys, but Render needs them configured separately

---

## Quick Fix Steps:

### 1. Update Backend `.env` File (Already done below)
The file has been updated with correct domains.

### 2. Configure Environment Variables on Render (CRITICAL)

Go to your Render dashboard and set these environment variables:

**Copy these from your local `.env` file:**

```
GOOGLE_API_KEY=<your-google-api-key>
GEMINI_API_KEY=<your-google-api-key>
FRONTEND_URL=https://www.wellnest.sbs
GOOGLE_CALLBACK_URL=https://api.wellnest.sbs/v1/api/oauth/google/callback
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-app-password>
MONGO_URI=<your-mongodb-connection-string>
ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
JWT_SECRET=<your-jwt-secret>
SESSION_SECRET=<your-session-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NODE_ENV=production
PORT=5000
```

**Important:** Use the actual values from your `backend/.env` file (don't commit that file to Git).

**How to set them on Render:**
1. Go to https://dashboard.render.com/
2. Select your backend service
3. Go to **Environment** tab
4. Add each variable above
5. Click **Save Changes**
6. Render will automatically redeploy

### 3. Update Google Cloud Console

Since you're changing domains, update OAuth settings:
1. Go to https://console.cloud.google.com/
2. Select your project → APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins**:
   - Add: `https://www.wellnest.sbs`
   - Add: `https://api.wellnest.sbs`
5. Update **Authorized redirect URIs**:
   - Add: `https://api.wellnest.sbs/v1/api/oauth/google/callback`
6. Save

---

## Testing After Fix:

### Test Meal Generation:
1. Login to `https://www.wellnest.sbs`
2. Go to Dashboard → Generate Meal Plan
3. Fill preferences and generate
4. Should work now

### Test AI Chatbot:
1. Go to AI Chat section
2. Send a message like "Hello" or "Create meal plan"
3. Should get AI response

### Check Backend Logs on Render:
1. Go to Render dashboard → Your service → Logs
2. Look for:
   - ✓ "GOOGLE_API_KEY: SET ✓"
   - ✓ "MongoDB connected"
   - ✗ Any errors about missing API keys

---

## Common Issues:

**"AI is not available"**
- Environment variable `GOOGLE_API_KEY` not set on Render
- Check Render logs for "MISSING ✗"

**"Failed to generate meal plan"**
- API key invalid or quota exceeded
- Check https://aistudio.google.com/ for API key status

**CORS errors**
- Already fixed in `backend/index.js`
- Make sure backend is redeployed

**OAuth not working**
- Update Google Cloud Console with new domains
- Clear browser cookies and try again

---

## Verify Environment Variables on Render:

Run this test endpoint after deployment:
```
https://api.wellnest.sbs/
```

Should show server is running. Check logs for environment variable status.
