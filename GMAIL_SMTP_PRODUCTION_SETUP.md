# Gmail SMTP Production Setup (No Domain Required)

## ✅ Solution Implemented

Your app now uses **Gmail SMTP with nodemailer** instead of Resend. This works perfectly for production **without needing a domain**.

## 📧 Why Gmail SMTP?

- ✅ **No domain required** - uses your Gmail address
- ✅ **500 emails/day** for free Gmail accounts
- ✅ **2000 emails/day** for Google Workspace accounts
- ✅ **Better deliverability** than test email services
- ✅ **Works on Render** and all cloud platforms

## 🔐 Step 1: Generate Gmail App Password

**IMPORTANT:** You must use an App Password, NOT your regular Gmail password.

### How to Generate:

1. **Enable 2-Factor Authentication**:
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: `WellNest Production`
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Current Setup in `.env`:
```env
EMAIL_USER=yash129912@gmail.com
EMAIL_PASS=kgtfltxbliqopeoq
```

✅ If `kgtfltxbliqopeoq` is your App Password, you're good!  
❌ If it's your regular password, **replace it with an App Password**

## 🚀 Step 2: Deploy to Render

### Add Environment Variables in Render:

Go to your Render service → **Environment** tab → Add these:

```
EMAIL_USER=yash129912@gmail.com
EMAIL_PASS=kgtfltxbliqopeoq

GEMINI_API_KEY=AIzaSyA7jWKZRTTkDOelzlWUMwGnVtJAxEiv9qI
GOOGLE_API_KEY=AIzaSyA7jWKZRTTkDOelzlWUMwGnVtJAxEiv9qI

MONGODB_URI=mongodb+srv://Rounak:Xl6ToMkAryiNlN3k@cluster0.4bp7jtu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=test

JWT_SECRET=chetan123
ACCESS_TOKEN_SECRET=chetan_access_token_secret_123
REFRESH_TOKEN_SECRET=chetan_refresh_token_secret_123
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
JWT_EXPIRE=30d

PORT=5000
NODE_ENV=production
```

### Click "Save Changes" - Render will auto-deploy

## 🧪 Step 3: Test Your Setup

### Test Locally First:
```bash
cd backend
npm run dev
```

Check the logs for:
```
✅ Gmail SMTP service initialized
📧 Emails will be sent from: yash129912@gmail.com
```

### Test on Render:
After deploying, use the debug endpoint:
```bash
curl -X POST https://your-app.onrender.com/v1/api/_debug/send-test-mail
```

## 📊 What Changed?

### Before (Resend):
```javascript
import { Resend } from 'resend';
const resend = new Resend(apiKey);
await resend.emails.send({ from: 'WellNest <onboarding@resend.dev>', ... });
```

### After (Gmail SMTP):
```javascript
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});
await transporter.sendMail({ from: '"WellNest" <yash129912@gmail.com>', ... });
```

## ⚠️ Gmail Limits

### Free Gmail Account:
- **500 emails/day**
- Perfect for small to medium apps
- Resets every 24 hours

### If You Need More:
1. **Google Workspace** ($6/month) - 2000 emails/day
2. **SendGrid** - Free tier: 100 emails/day, paid: unlimited
3. **AWS SES** - $0.10 per 1000 emails

## 🔍 Troubleshooting

### Error: "Invalid login: 535-5.7.8"
**Cause:** Using regular password instead of App Password  
**Fix:** Generate App Password and update `EMAIL_PASS`

### Error: "Less secure app access"
**Cause:** Gmail blocked the login  
**Fix:** Use App Password (requires 2FA enabled)

### Error: "Daily sending quota exceeded"
**Cause:** Sent more than 500 emails today  
**Fix:** Wait 24 hours or upgrade to Google Workspace

### Error: "Connection timeout"
**Cause:** Network/firewall issue  
**Fix:** Check if port 587 is accessible

## ✅ Production Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated (16 characters)
- [ ] `EMAIL_USER` set to your Gmail address
- [ ] `EMAIL_PASS` set to App Password (no spaces)
- [ ] Environment variables added in Render
- [ ] Service deployed on Render
- [ ] Test email sent successfully
- [ ] Logs show "✅ Gmail SMTP service initialized"

## 📧 Email Deliverability Tips

1. **Warm up your account**: Start with a few emails per day
2. **Avoid spam triggers**: Don't send bulk emails immediately
3. **Test with multiple providers**: Gmail, Yahoo, Outlook
4. **Monitor bounce rates**: Check if emails are being received
5. **Use proper from name**: `"WellNest" <yash129912@gmail.com>`

## 🎯 Next Steps (Optional)

### When You Outgrow Gmail (500+ emails/day):

1. **SendGrid** (Recommended):
   - Free tier: 100 emails/day
   - Paid: $19.95/month for 50,000 emails
   - Better analytics and deliverability

2. **AWS SES** (Cheapest):
   - $0.10 per 1000 emails
   - Requires domain verification
   - Best for high volume

3. **Google Workspace**:
   - $6/user/month
   - 2000 emails/day
   - Professional email address

## 📚 Resources

- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **Nodemailer Docs**: https://nodemailer.com/
- **Gmail SMTP Settings**: https://nodemailer.com/usage/using-gmail/
- **Render Docs**: https://render.com/docs/environment-variables

---

## Summary

✅ **No domain needed** - Your Gmail works perfectly  
✅ **500 emails/day** - Enough for most startups  
✅ **Production ready** - Works reliably on Render  
✅ **Free** - No additional cost  

Just add the environment variables in Render and deploy! 🚀
