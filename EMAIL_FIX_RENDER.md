# 📧 Email System Fix for Render Deployment

## Problem
Email sending is failing on Render with "Failed to send email" error.

## Root Causes

### 1. **Gmail App Password Not Configured** ⚠️
Gmail no longer allows regular passwords for third-party apps. You MUST use App Passwords.

### 2. **Missing Environment Variables on Render**
Environment variables (EMAIL_USER, EMAIL_PASS) may not be set in Render dashboard.

### 3. **SMTP Configuration Issues**
Using `service: "gmail"` shorthand can be unreliable on some hosting platforms.

---

## ✅ Solutions Implemented

### 1. Enhanced Email Configuration
- Changed from service shorthand to explicit SMTP configuration
- Added connection pooling for better performance
- Added transporter verification on startup
- Added detailed error logging

### 2. Better Error Handling
- Detailed error messages with error codes
- Console logging for debugging
- Graceful failure handling

---

## 🔧 Required Actions on Your End

### **Step 1: Generate Gmail App Password**

1. **Enable 2-Factor Authentication** (if not already enabled)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup instructions

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as app
   - Select "Other (Custom name)" as device
   - Enter "WellNest Backend"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

### **Step 2: Configure Render Environment Variables**

1. Go to your Render Dashboard
2. Select your backend service
3. Navigate to **Environment** tab
4. Add these environment variables:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**IMPORTANT:** 
- Use your actual Gmail address for `EMAIL_USER`
- Use the 16-character App Password (no spaces) for `EMAIL_PASS`
- NOT your regular Gmail password!

### **Step 3: Redeploy on Render**

After adding environment variables:
1. Click **Manual Deploy** → **Deploy latest commit**
2. Or push a new commit to trigger auto-deployment

### **Step 4: Check Logs**

After deployment, check Render logs for:
- ✅ `Email server is ready to send messages` - Success!
- ❌ `Email transporter verification failed` - Check credentials
- ❌ `EMAIL_USER or EMAIL_PASS environment variables are not set` - Add env vars

---

## 🧪 Testing Locally

To test locally before deploying:

1. Create/update `.env` file in backend directory:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

2. Run the backend:
```bash
cd backend
npm start
```

3. Check console for:
```
✅ Email server is ready to send messages
```

4. Test OTP email by registering a new user

---

## 🔍 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** You're using regular Gmail password instead of App Password
- Generate App Password (see Step 1)
- Update `EMAIL_PASS` in Render environment variables

### Error: "EMAIL_USER or EMAIL_PASS environment variables are not set"
**Solution:** Environment variables not configured in Render
- Go to Render Dashboard → Environment tab
- Add `EMAIL_USER` and `EMAIL_PASS`
- Redeploy

### Error: "ETIMEDOUT" or "ECONNREFUSED"
**Solution:** SMTP port blocked or network issue
- The code now uses port 465 (SSL)
- Alternative: Try port 587 with `secure: false`
- Check if Render has any firewall restrictions

### Error: "self signed certificate"
**Solution:** SSL certificate validation issue
- Already handled with `rejectUnauthorized: false`
- In production, consider using verified certificates

### Emails still not sending after all steps
1. **Verify Gmail account isn't locked**
   - Check https://myaccount.google.com/notifications
   - Look for security alerts

2. **Try with a different Gmail account**
   - Some accounts have stricter security

3. **Check Render service logs in real-time**
   - Look for specific error messages
   - Check for detailed error codes

4. **Alternative: Use SendGrid or AWS SES**
   - More reliable for production
   - Better deliverability rates
   - Dedicated IP addresses

---

## 📊 What Changed in Code

### Before:
```javascript
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
```

### After:
```javascript
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
});

// Added connection verification
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});
```

---

## 🚀 Alternative Email Services (Optional)

If Gmail continues to be problematic, consider these alternatives:

### **1. SendGrid** (Recommended for production)
```bash
npm install @sendgrid/mail
```

### **2. AWS SES** (Amazon Simple Email Service)
- Cost-effective
- High deliverability
- Requires AWS account

### **3. Mailgun**
- Easy setup
- Good free tier
- Reliable delivery

### **4. Postmark**
- Excellent deliverability
- Great support
- Transaction-focused

---

## 📝 Checklist

- [ ] Enabled 2FA on Gmail account
- [ ] Generated Gmail App Password
- [ ] Added `EMAIL_USER` to Render environment variables
- [ ] Added `EMAIL_PASS` (App Password) to Render environment variables
- [ ] Redeployed application on Render
- [ ] Checked Render logs for "Email server is ready" message
- [ ] Tested OTP email by registering new user
- [ ] Tested meal plan email functionality
- [ ] Verified emails arrive in inbox (check spam folder too)

---

## 📧 Support

If you continue to face issues:
1. Check Render logs for specific error messages
2. Verify App Password is correct (no spaces, 16 characters)
3. Try with a different Gmail account
4. Consider alternative email service providers

---

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ `Email server is ready to send messages` in Render logs
- ✅ `OTP Email sent successfully` when users register
- ✅ `Meal Plan Email sent successfully` when sending meal plans
- ✅ Users receive emails in their inbox

---

**Last Updated:** October 25, 2025
**Version:** 1.0
