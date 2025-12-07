# Fix: Keep Users on www.wellnest.sbs Domain

## Problem
After login, users are being redirected to Vercel's default domain (*.vercel.app) instead of staying on www.wellnest.sbs.

## Solution

### 1. Set Primary Domain in Vercel (MOST IMPORTANT)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Find `www.wellnest.sbs` in the list
3. Click the **three dots** (⋮) next to it
4. Click **"Set as Primary Domain"**
5. This ensures all new deployments and redirects use your custom domain

### 2. Redirect All Vercel Domains to Custom Domain

The `vercel.json` has been updated to automatically redirect:
- All `*.vercel.app` domains → `www.wellnest.sbs`
- Root domain `wellnest.sbs` → `www.wellnest.sbs`

**You MUST redeploy for these changes to take effect:**

```bash
cd frontend
git add vercel.json
git commit -m "Add domain redirects to keep users on custom domain"
git push
```

Vercel will auto-deploy, or manually trigger from the Deployments tab.

### 3. Verify Domain Priority

In Vercel Settings → Domains, your domains should be in this order:
1. ✓ **www.wellnest.sbs** (Primary) ← This is crucial!
2. wellnest.sbs (redirects to www)
3. *.vercel.app domains (redirects to www)

### 4. Update Environment Variables

Make sure `VITE_API_URL` is set correctly:
- **Value**: `https://api.wellnest.sbs`
- **Scope**: Production, Preview, Development

### 5. Clear Browser Cache

After redeploying:
- Clear browser cache (Ctrl+Shift+Delete)
- Or open in incognito/private mode
- Test the full login flow

---

## How It Works

**Before:**
- User visits `www.wellnest.sbs`
- Logs in successfully
- Gets redirected to `wellnest-abc123.vercel.app/dashboard`

**After:**
- User visits `www.wellnest.sbs`
- Logs in successfully
- Stays on `www.wellnest.sbs/dashboard`
- All Vercel URLs automatically redirect to custom domain

---

## Test the Fix

1. Visit `https://www.wellnest.sbs`
2. Log in
3. Navigate to dashboard, meal plans, etc.
4. Check the URL bar - should always show `www.wellnest.sbs/*`
5. Try accessing old Vercel URL directly - should redirect

If you still see Vercel URLs, check:
- [ ] Primary domain is set correctly in Vercel
- [ ] New deployment has completed
- [ ] Browser cache is cleared
- [ ] You're testing after the deployment finished

---

## Additional: Remove Old Vercel Domains (Optional)

If you want ONLY your custom domain:
1. Go to Vercel → Settings → Domains
2. Keep: `www.wellnest.sbs` and `wellnest.sbs`
3. Remove all `*.vercel.app` domains (optional, but they'll still redirect)

**Note**: Vercel always creates a default `*.vercel.app` domain, but it will redirect to your primary domain automatically.
