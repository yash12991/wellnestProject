# Google OAuth Setup Guide for WellNest

## Overview
Google OAuth has been implemented to allow users to sign in with their Google account. No OTP verification is required for OAuth users.

## Features Added
✅ "Sign in with Google" button on login page
✅ Auto-verification for OAuth users (no OTP needed)
✅ Account linking (if user already exists with same email)
✅ Auto-redirect to onboarding or dashboard
✅ Works alongside existing email/password login

## Setup Instructions

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Configure consent screen if prompted:
     - User Type: **External**
     - App name: **WellNest**
     - User support email: Your email
     - Developer contact: Your email
     - Add scopes: `email`, `profile`
   
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **WellNest OAuth**
   - Authorized JavaScript origins:
     ```
     http://localhost:5000
     http://localhost:5173
     https://your-production-domain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5000/v1/api/oauth/google/callback
     https://your-backend-domain.com/v1/api/oauth/google/callback
     ```
   - Click **Create**

6. Copy your credentials:
   - **Client ID**: `XXXXXXXXXX.apps.googleusercontent.com`
   - **Client Secret**: `XXXXXXXXXXXXXXXX`

### 2. Update Environment Variables

**Backend (.env):**
```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/v1/api/oauth/google/callback
SESSION_SECRET=your-secure-random-session-secret-here
FRONTEND_URL=http://localhost:5173
```

**For Production (Render):**
Add these environment variables in Render dashboard:
```
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/v1/api/oauth/google/callback
FRONTEND_URL=https://your-frontend-domain.com
SESSION_SECRET=your-production-session-secret
```

### 3. Test the Implementation

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Go to `http://localhost:5173/login`
4. Click "Continue with Google"
5. Select your Google account
6. Verify redirect to dashboard or onboarding

## How It Works

### Backend Flow:
1. User clicks "Continue with Google" → redirects to `/v1/api/oauth/google`
2. Passport authenticates with Google
3. Google redirects to `/v1/api/oauth/google/callback`
4. Backend checks if user exists:
   - **Exists with Google ID**: Log them in
   - **Exists with email**: Link Google account and log in
   - **New user**: Create account with Google info
5. Generate JWT tokens and redirect to frontend with tokens in URL

### Frontend Flow:
1. Receives tokens in `/oauth-callback` route
2. Stores tokens and user data in localStorage
3. Redirects to dashboard (if onboarding complete) or onboarding page

## User Model Changes

Added fields to User schema:
```javascript
googleId: {
  type: String,
  unique: true,
  sparse: true,
},
profilePicture: {
  type: String,
},
password: {
  type: String,
  required: false, // Not required for OAuth users
}
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong SESSION_SECRET** - Generate with: `openssl rand -base64 32`
3. **HTTPS in Production** - Always use HTTPS for OAuth callbacks
4. **Validate redirect URIs** - Only whitelist your actual domains
5. **Keep credentials secure** - Use Render environment variables for production

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that your callback URL in Google Console matches exactly
- Include `http://` or `https://`
- No trailing slash

### Error: "OAuth failed"
- Check browser console for detailed error
- Verify environment variables are set correctly
- Ensure Google+ API is enabled

### User can't sign in
- Check backend logs for detailed error messages
- Verify MongoDB connection
- Check if email is already registered with password

## Files Modified

**Backend:**
- `src/config/passport.js` (new) - Passport Google OAuth strategy
- `src/routes/auth.routes.js` (new) - OAuth routes
- `src/Models/User.models.js` - Added googleId and profilePicture fields
- `index.js` - Added passport initialization and session middleware
- `.env` - Added Google OAuth credentials

**Frontend:**
- `src/pages/Login.jsx` - Added Google Sign In button
- `src/pages/OAuthCallback.jsx` (new) - Handles OAuth redirect
- `src/pages/Login.css` - Added styles for Google button
- `src/App.jsx` - Added OAuth callback route

## Testing Checklist

- [ ] Google OAuth button appears on login page
- [ ] Clicking button redirects to Google sign-in
- [ ] Can select Google account
- [ ] Redirects back to app after authentication
- [ ] User is logged in and redirected appropriately
- [ ] New users go to onboarding
- [ ] Existing users with complete onboarding go to dashboard
- [ ] OAuth users don't need OTP verification
- [ ] Regular email/password login still works

## Next Steps

1. Generate your Google OAuth credentials
2. Update `.env` file with your Client ID and Secret
3. Test on localhost
4. Add production URLs to Google Console
5. Deploy to Render with environment variables
6. Test production deployment

## Support

If you encounter issues:
1. Check backend logs: `npm run dev` (backend)
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure Google+ API is enabled in Google Console
