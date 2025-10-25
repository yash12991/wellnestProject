# Render Deployment Checklist for WellNest Backend

## 🔧 Environment Variables to Set on Render

Go to your Render dashboard → Your service → Environment → Add the following:

### Required Variables:
```
MONGO_URI=mongodb+srv://chetan:gvaw0ALPC8FYGv0j@cluster0.4bp7jtu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

MONGODB_URI=mongodb+srv://chetan:gvaw0ALPC8FYGv0j@cluster0.4bp7jtu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

MONGODB_DB=test

PORT=5000

NODE_ENV=production

JWT_SECRET=chetan123

JWT_EXPIRE=30d

ACCESS_TOKEN_SECRET=chetan_access_token_secret_123

ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=chetan_refresh_token_secret_123

REFRESH_TOKEN_EXPIRY=7d

GEMINI_API_KEY=AIzaSyCag34acSLKWABgWm__U1FHlZ1c8_U_cKk

GOOGLE_API_KEY=AIzaSyCag34acSLKWABgWm__U1FHlZ1c8_U_cKk

RESEND_API_KEY=re_BB8swc2Z_NVuWwGa3tipreNyZv6mxGnMS
```

## 🚀 Build & Start Commands

### Build Command:
```bash
npm install
```

### Start Command:
```bash
node index.js
```

## 🔍 Common Issues & Fixes

### 1. 502 Bad Gateway Error
- **Cause**: Backend service is crashing or not responding
- **Fix**: Check Render logs for errors
- **Check**: All environment variables are set correctly

### 2. CORS Errors
- **Cause**: Frontend domain not allowed
- **Fix**: Already fixed in code - CORS now allows all Vercel domains
- **Verify**: Check that your frontend domain is included in the CORS whitelist

### 3. Email Service Errors
- **Cause**: RESEND_API_KEY not set or invalid
- **Fix**: Verify the API key is correct on Render
- **Test**: Use the `/v1/api/test-email` endpoint to test emails

### 4. MongoDB Connection Issues
- **Cause**: MONGO_URI not set or MongoDB Atlas IP whitelist
- **Fix**: 
  - Verify MONGO_URI is correct
  - In MongoDB Atlas, add `0.0.0.0/0` to Network Access to allow all IPs

## 📝 Deployment Steps

1. **Push your code to GitHub** (already done ✅)
   
2. **Go to Render Dashboard**
   - Select your backend service
   
3. **Update Environment Variables**
   - Add all variables listed above
   - Click "Save Changes"
   
4. **Manual Deploy** (if auto-deploy is off)
   - Click "Manual Deploy" → "Deploy latest commit"
   
5. **Check Logs**
   - Go to "Logs" tab
   - Look for "✅ Resend email service initialized"
   - Look for "✅ Email server is ready to send messages"
   - Look for "MongoDB connected"
   - Look for "Server is running on port 5000"

6. **Test the API**
   - Visit: `https://wellnestproject.onrender.com/health/db`
   - Should return: `{"status":"connected"}`
   
   - Visit: `https://wellnestproject.onrender.com/`
   - Should return: `{"message":"Welcome to Wellnest API"}`

## 🔗 Frontend Configuration

Update your frontend API URL if needed:

In your frontend environment variables or config:
```javascript
const API_URL = 'https://wellnestproject.onrender.com'
```

## ✅ Verification Checklist

- [ ] All environment variables are set on Render
- [ ] Backend service is deployed successfully
- [ ] MongoDB connection is working (`/health/db` returns "connected")
- [ ] CORS is configured (allows your frontend domain)
- [ ] Email service is initialized (check logs for "✅ Resend email service initialized")
- [ ] API endpoints respond correctly
- [ ] Frontend can make requests without CORS errors

## 🆘 Still Having Issues?

Check Render logs for specific errors:
```bash
# Common error patterns to look for:
- "Cannot find module" → Missing npm install
- "ECONNREFUSED" → MongoDB connection issue
- "RESEND_API_KEY" → Environment variable missing
- Port already in use → Restart the service
```

## 📞 Support Resources

- Render Status: https://status.render.com/
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://cloud.mongodb.com/
- Resend Docs: https://resend.com/docs
