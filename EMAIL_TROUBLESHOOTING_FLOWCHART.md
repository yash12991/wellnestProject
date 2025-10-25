# 🔍 Email Troubleshooting Flowchart

```
┌─────────────────────────────────────┐
│   Email Send Request Triggered      │
│  (OTP or Meal Plan Email)           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Check: Are EMAIL_USER & EMAIL_PASS  │
│        set in environment?           │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │   NO    │ ───► ❌ Error: "Missing credentials"
         └─────────┘      └► FIX: Set environment variables in Render
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Initialize Nodemailer Transporter   │
│ (Gmail SMTP, Port 587)               │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Verify Connection to Gmail SMTP     │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │  FAIL   │ ───► ❌ Error: "EAUTH - Authentication failed"
         └─────────┘      │
              │           ├─► Cause 1: Using regular Gmail password
              │           │   └► FIX: Generate & use App Password
         ┌────┴────┐      │
         │ SUCCESS │      ├─► Cause 2: Wrong email/password
         └────┬────┘      │   └► FIX: Double-check credentials
              │           │
              │           └─► Cause 3: 2FA not enabled
              │               └► FIX: Enable 2FA to create App Password
              ▼
┌─────────────────────────────────────┐
│ ✅ "Email server is ready to send"  │
│     (Logged on server startup)       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Attempt to Send Email                │
│ (sendOTPEmail or sendMealPlanEmail)  │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │  FAIL   │ ───► ❌ Possible Errors:
         └─────────┘      │
              │           ├─► "ECONNECTION" / "ETIMEDOUT"
              │           │   └► Network/firewall issue
         ┌────┴────┐      │   └► FIX: Check Render network status
         │ SUCCESS │      │
         └────┬────┘      ├─► "Invalid recipient"
              │           │   └► Email address format wrong
              │           │   └► FIX: Validate email format
              │           │
              │           └─► "Message size limit"
              │               └► PDF attachment too large
              │               └► FIX: Reduce PDF size
              ▼
┌─────────────────────────────────────┐
│ ✅ Email Sent Successfully           │
│    "Email sent: <message-id>"        │
└─────────────────────────────────────┘
```

---

## 🎯 Quick Diagnostic Commands

### Check if Environment Variables are Set (Render Logs)
Look for at startup:
```
✅ Email server is ready to send messages
📧 Email configured with: your-email@gmail.com
```

If you see:
```
❌ Email transporter configuration error
📧 Check your EMAIL_USER and EMAIL_PASS environment variables
```
**Action:** Environment variables missing or incorrect

---

## 📊 Error Code Reference

| Error Code | Meaning | Most Likely Fix |
|------------|---------|-----------------|
| `EAUTH` | Authentication failed | Use App Password, not regular password |
| `ECONNECTION` | Cannot connect to SMTP | Network issue or wrong host/port |
| `ETIMEDOUT` | Connection timeout | SMTP server unreachable |
| `EENVELOPE` | Invalid email address | Check recipient email format |
| `EMESSAGE` | Message content error | Check email HTML/content |

---

## 🔧 Step-by-Step Debugging

### 1. Check Render Logs During Startup
```
Expected: ✅ Email server is ready to send messages
If Error: ❌ Email transporter configuration error
```

### 2. Check Render Logs When Email is Triggered
```
Expected: 📧 Attempting to send OTP email to: user@example.com
         ✅ OTP Email sent successfully: <message-id>
         
If Error: ❌ Failed to send OTP email: [error message]
         📋 Error details: { code, command, response }
```

### 3. Common Error Messages & Instant Fixes

#### "Invalid login: 535-5.7.8"
```
Problem: Using regular Gmail password
Fix: Generate App Password at https://myaccount.google.com/apppasswords
```

#### "Missing credentials"
```
Problem: EMAIL_USER or EMAIL_PASS not set
Fix: Add to Render → Environment → Variables
```

#### "Connection timeout"
```
Problem: Cannot reach Gmail SMTP (port blocked or network issue)
Fix: Code already includes TLS settings; Check Render status
```

---

## ✅ Success Indicators

You'll know email is working when you see ALL of these in Render logs:

1. **On Server Start:**
   ```
   ✅ Email server is ready to send messages
   📧 Email configured with: your-email@gmail.com
   ```

2. **On Email Send:**
   ```
   📧 Attempting to send OTP email to: user@example.com
   ✅ OTP Email sent successfully: <1234567.890@gmail.com>
   📬 Response: 250 2.0.0 OK
   ```

3. **User Receives Email:** Check inbox/spam folder

---

## 🆘 Still Stuck? Try This:

1. **Test locally first:**
   - Create `.env` with EMAIL_USER and EMAIL_PASS
   - Run backend locally
   - Trigger email function
   - Check console for detailed errors

2. **Verify Gmail Settings:**
   - https://myaccount.google.com/security
   - Ensure 2FA is ON
   - Check App Passwords section

3. **Check Render Environment:**
   - Dashboard → Service → Environment
   - Verify EMAIL_USER and EMAIL_PASS are present
   - Click "Redeploy" after any changes

4. **Alternative Solution:**
   - Switch to SendGrid (see QUICK_EMAIL_FIX_RENDER.md)
   - Free tier: 100 emails/day
   - More reliable for production

---

**Next Steps:** Follow `QUICK_EMAIL_FIX_RENDER.md` for immediate fix
