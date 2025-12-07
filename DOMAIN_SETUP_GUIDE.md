# Domain Setup Guide: www.wellnest.sbs

This guide will help you configure your domain `wellnest.sbs` to work with:
- **Frontend**: Vercel
- **Backend**: Render

## Step 1: Configure DNS Records (Domain Registrar)

Go to your domain registrar where you purchased `wellnest.sbs` and add these DNS records:

### For Frontend (www.wellnest.sbs)

1. **Add CNAME record for www:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 3600 (or Auto)

2. **Add A record for root domain (optional, for wellnest.sbs):**
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `76.76.21.21` (Vercel's IP)
   - TTL: 3600

### For Backend (api.wellnest.sbs)

3. **Add CNAME record for API:**
   - Type: `CNAME`
   - Name: `api`
   - Value: `[your-render-service].onrender.com` (Get this from Render dashboard)
   - TTL: 3600

**Example:**
If your Render backend URL is `https://wellnest-backend.onrender.com`, use `wellnest-backend.onrender.com` as the value.

---

## Step 2: Add Domain to Vercel (Frontend)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `wellnest` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `www.wellnest.sbs`
6. Click **Add**
7. (Optional) Also add `wellnest.sbs` if you want the root domain to work
8. Vercel will verify the DNS records (may take up to 48 hours, usually faster)

---

## Step 3: Add Domain to Render (Backend)

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service
3. Go to **Settings** → **Custom Domain**
4. Click **Add Custom Domain**
5. Enter: `api.wellnest.sbs`
6. Click **Save**
7. Render will provide verification instructions and verify the CNAME record

---

## Step 4: Update Backend CORS Configuration

Add the new domain to the CORS allowed origins in `backend/index.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://www.wellnest.sbs',         // ← ADD THIS
    'https://wellnest.sbs',              // ← ADD THIS
    'https://wellnest.vercel.app',
    'https://wellnestproject.vercel.app',
    'https://wellnest-initial-fixedrecent.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};
```

**Then deploy the changes to Render:**
```bash
git add .
git commit -m "Add custom domain to CORS"
git push
```

---

## Step 5: Update Frontend Environment Variables

Set the API URL to point to your new backend domain:

### On Vercel Dashboard:
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update this variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api.wellnest.sbs`
   - **Environment**: Production, Preview, Development

4. Click **Save**
5. **Redeploy** your frontend from the **Deployments** tab

---

## Step 6: Update Google OAuth (If Using)

If you're using Google OAuth, you need to update the authorized domains:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   - `https://www.wellnest.sbs`
   - `https://wellnest.sbs`
   - `https://api.wellnest.sbs`
6. Under **Authorized redirect URIs**, add:
   - `https://api.wellnest.sbs/v1/api/auth/google/callback`
   - `https://www.wellnest.sbs/auth/callback` (if needed)
7. Click **Save**

---

## Step 7: Verify Everything Works

### Test Frontend:
1. Visit `https://www.wellnest.sbs`
2. Check if the site loads properly
3. Open browser DevTools (F12) → Console
4. Look for API connection messages

### Test Backend:
1. Visit `https://api.wellnest.sbs` (should show "WellNest Dashboard" or similar)
2. Test an API endpoint: `https://api.wellnest.sbs/v1/api/auth/profile`

### Test Full Flow:
1. Try logging in on your frontend
2. Generate a meal plan
3. Use the chatbot
4. Verify all features work

---

## Troubleshooting

### DNS Not Propagating
- DNS changes can take 1-48 hours
- Check status: https://dnschecker.org/
- Enter your domain and select CNAME/A record

### SSL Certificate Issues
- Both Vercel and Render automatically provision SSL certificates
- Wait 10-15 minutes after adding the domain
- If issues persist, check DNS records are correct

### CORS Errors
- Verify backend CORS includes your new domain
- Check browser console for exact error
- Ensure credentials: true is set
- Verify the backend is redeployed after CORS changes

### 404 Errors
- Ensure DNS records point to correct values
- Verify domains are added in Vercel and Render dashboards
- Check deployment logs for errors

---

## Quick Checklist

- [ ] DNS CNAME for `www` → `cname.vercel-dns.com`
- [ ] DNS CNAME for `api` → `[your-service].onrender.com`
- [ ] Domain added to Vercel project
- [ ] Custom domain added to Render service
- [ ] CORS updated in backend with new domains
- [ ] Backend redeployed
- [ ] VITE_API_URL environment variable set in Vercel
- [ ] Frontend redeployed
- [ ] Google OAuth updated (if applicable)
- [ ] Tested login, meal plans, and chatbot

---

## Current Configuration Summary

**Frontend Domain**: `https://www.wellnest.sbs`  
**Backend Domain**: `https://api.wellnest.sbs`  
**Frontend Host**: Vercel  
**Backend Host**: Render  

Once complete, users will access your app at `https://www.wellnest.sbs` and all API calls will go to `https://api.wellnest.sbs`.
