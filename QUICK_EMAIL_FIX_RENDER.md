# 🚀 Quick Fix: Email Not Working on Render

## The Problem
"Failed to send email" error on Render deployment.

## The #1 Most Common Cause
**Using regular Gmail password instead of App Password** ❌

## ⚡ Quick Fix (5 minutes)

### 1. Generate Gmail App Password
```
1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Factor Auth if needed
3. Create App Password for "Mail" → "Other (WellNest)"
4. Copy the 16-character password (remove spaces)
```

### 2. Set Environment Variables in Render
```
Dashboard → Your Service → Environment Tab → Add:

EMAIL_USER = your-email@gmail.com
EMAIL_PASS = abcdwxyzabcdwxyz  (16-char app password, NO SPACES)
```

### 3. Redeploy
```
Click "Manual Deploy" → "Deploy latest commit"
```

### 4. Check Logs
Look for: ✅ "Email server is ready to send messages"

---

## Still Not Working?

### Check These:
1. ✅ 2FA enabled on Gmail?
2. ✅ App Password (not regular password)?
3. ✅ No spaces in password?
4. ✅ EMAIL_USER is your full email?
5. ✅ Redeployed after setting variables?

### Quick Test Command (in Render logs):
Look for these messages:
- ✅ Success: "Email server is ready to send messages"
- ❌ Auth Error: "Authentication failed" → Wrong App Password
- ❌ Missing: "EMAIL_USER or EMAIL_PASS environment variables are not set"

---

## Alternative: Use SendGrid (If Gmail Fails)

**Free Tier:** 100 emails/day

1. Sign up: https://sendgrid.com/
2. Get API Key from dashboard
3. Update Render environment:
   ```
   SENDGRID_API_KEY = your-api-key
   EMAIL_USER = verified-sender@yourdomain.com
   ```
4. Update backend code (see EMAIL_FIX_RENDER.md)

---

## 📝 Remember:
- App Password ≠ Gmail Password
- Must redeploy after env variable changes
- Check Render logs for detailed error messages

**Full guide:** See `EMAIL_FIX_RENDER.md`
