# Google OAuth Configuration for Your WellNest App

## Your Production URLs
- **Backend**: https://wellnestproject.onrender.com
- **Frontend**: https://wellnest-project.vercel.app

---

## Step 1: Configure Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

### Add Authorized JavaScript origins:
```
http://localhost:5173
http://localhost:5000
https://wellnest-project.vercel.app
```

### Add Authorized redirect URIs:
```
http://localhost:5000/v1/api/oauth/google/callback
https://wellnestproject.onrender.com/v1/api/oauth/google/callback
```

**⚠️ Important:** 
- Copy EXACTLY as shown (no trailing slashes)
- Changes may take 5 minutes to activate

---

## Step 2: Update Local Environment (.env)

After creating credentials in Google Console, copy your **Client ID** and **Client Secret**, then update `.env`:

```env
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/v1/api/oauth/google/callback
SESSION_SECRET=your-secure-random-secret-here
FRONTEND_URL=http://localhost:5173
```

Generate a secure session secret:
```bash
openssl rand -base64 32
```

---

## Step 3: Configure Render Environment Variables

Go to your Render dashboard → wellnestproject → Environment

Add these variables:

```
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_CALLBACK_URL=https://wellnestproject.onrender.com/v1/api/oauth/google/callback
SESSION_SECRET=your-production-session-secret
FRONTEND_URL=https://wellnest-project.vercel.app
```

**Also ensure these are set:**
```
GEMINI_API_KEY=your_new_gemini_key
RESEND_API_KEY=re_BB8swc2Z_NVuWwGa3tipreNyZv6mxGnMS
MONGODB_URI=mongodb+srv://...
JWT_SECRET=chetan123
ACCESS_TOKEN_SECRET=chetan_access_token_secret_123
REFRESH_TOKEN_SECRET=chetan_refresh_token_secret_123
```

---

## Step 4: Test

### Local Testing:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to: http://localhost:5173/login
4. Click "Continue with Google"
5. Select Google account
6. Should redirect to dashboard

### Production Testing:
1. Deploy to Render (ensure env vars are set)
2. Deploy to Vercel
3. Go to: https://wellnest-project.vercel.app/login
4. Click "Continue with Google"
5. Sign in and verify redirect

---

## Quick Reference

**Google Console URLs to add:**

JavaScript Origins:
- http://localhost:5173
- http://localhost:5000  
- https://wellnest-project.vercel.app

Redirect URIs:
- http://localhost:5000/v1/api/oauth/google/callback
- https://wellnestproject.onrender.com/v1/api/oauth/google/callback

---

## Troubleshooting

### "redirect_uri_mismatch" error
- Double-check URIs in Google Console match EXACTLY
- Wait 5-10 minutes after adding URIs
- Clear browser cache

### OAuth button not working
- Check browser console for errors
- Verify `API_URL` in frontend points to correct backend
- Ensure backend is running

### Users not being created
- Check backend logs on Render
- Verify MongoDB connection
- Check Gemini API key is valid

---

## Current Status

✅ Code implemented
✅ OAuth routes created
✅ Frontend button added
✅ User model updated
✅ Production URLs configured

⏳ Pending:
1. Get Google OAuth credentials from console
2. Update local .env file
3. Update Render environment variables
4. Test locally
5. Test production

---

Ready to go! Just get your Google OAuth credentials and update the environment variables! 🚀
