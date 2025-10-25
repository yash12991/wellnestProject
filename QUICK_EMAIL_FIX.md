# ⚡ Quick Email Fix - Render Deployment

## The Problem
`Failed to send email` on Render

## The Solution (3 Steps)

### 1️⃣ Generate Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Create password for "Mail" app
3. Copy 16-character code (e.g., `abcdefghijklmnop`)

### 2️⃣ Add to Render Environment Variables
1. Render Dashboard → Your Service → **Environment** tab
2. Add:
   ```
   EMAIL_USER = your-gmail@gmail.com
   EMAIL_PASS = abcdefghijklmnop
   ```

### 3️⃣ Redeploy
Click **Manual Deploy** → **Deploy latest commit**

## Check Success
Look for in Render logs:
```
✅ Email server is ready to send messages
```

## Still Not Working?
- Double-check App Password (no spaces, 16 chars)
- Ensure 2FA is enabled on Gmail
- Check spam folder for test emails
- View detailed guide: `EMAIL_FIX_RENDER.md`

---

**That's it! 🎉**
