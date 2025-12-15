# 🏥 Health Check API - Uptime Robot Setup

## ✅ Health Check Endpoints Created

### 1. **Main Health Check** (Recommended for Uptime Robot)
```
GET https://your-domain.com/health
```

**Response (Status 200 - Healthy):**
```json
{
  "status": "UP",
  "timestamp": "2025-12-15T22:10:00.000Z",
  "uptime": 3600,
  "service": "WellNest API",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "UP",
      "state": "connected",
      "responseTime": "15ms"
    },
    "memory": {
      "status": "UP",
      "heapUsed": "45MB",
      "heapTotal": "60MB",
      "rss": "80MB"
    }
  }
}
```

**Response (Status 503 - Unhealthy):**
```json
{
  "status": "DEGRADED",
  "timestamp": "2025-12-15T22:10:00.000Z",
  "uptime": 3600,
  "service": "WellNest API",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "DOWN",
      "state": "disconnected",
      "error": "Connection timeout"
    }
  }
}
```

### 2. **Simple Ping** (Fastest - Minimal Response)
```
GET https://your-domain.com/ping
```

**Response:**
```
pong
```

### 3. **Database Health** (Database Only)
```
GET https://your-domain.com/health/db
```

**Response:**
```json
{
  "status": "connected"
}
```

---

## 🤖 Uptime Robot Configuration

### Setup Steps:

1. **Log in to Uptime Robot**: https://uptimerobot.com/

2. **Add New Monitor**:
   - Click "+ Add New Monitor"
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: WellNest API Health
   - **URL**: `https://wellnest-backend.onrender.com/health` (or your domain)
   - **Monitoring Interval**: 5 minutes (free) or 1 minute (paid)

3. **Configure Alert Contacts**:
   - Add your email
   - Add Slack webhook (optional)
   - Add SMS (if available)

4. **Advanced Settings**:
   - **HTTP Method**: GET
   - **Expected Status Code**: 200
   - **Keyword Check** (optional): Look for "UP" in response
   - **Alert When**: Down
   - **Timeout**: 30 seconds

### Recommended Monitors:

#### Monitor 1: Main Health Check
```
Name: WellNest API - Health Check
URL: https://your-domain.com/health
Interval: 5 minutes
Alert: When status code is not 200 OR when "DOWN" appears in response
```

#### Monitor 2: Simple Ping (Backup)
```
Name: WellNest API - Ping
URL: https://your-domain.com/ping
Interval: 5 minutes
Alert: When status code is not 200 OR when response is not "pong"
```

#### Monitor 3: Database Check
```
Name: WellNest API - Database
URL: https://your-domain.com/health/db
Interval: 10 minutes
Alert: When "disconnected" appears in response
```

---

## 🔔 Alert Configuration

### Email Alerts:
```
Subject: [WellNest] Service Down Alert
When to send: After 2 failed checks (10 minutes)
```

### Slack Integration:
1. Create Slack Webhook in your workspace
2. Add webhook URL to Uptime Robot contacts
3. Customize alert message:
```
🚨 WellNest API is DOWN!
Monitor: *monitor-name*
Status: *monitor-status*
Time: *monitor-datetime*
URL: *monitor-url*
```

---

## 📊 What Each Endpoint Checks

### `/health` (Comprehensive)
- ✅ Server uptime
- ✅ Database connection (with ping test)
- ✅ Database response time
- ✅ Memory usage
- ✅ Overall system health
- **Returns**: Detailed JSON with all checks

### `/ping` (Simple)
- ✅ Server is responding
- **Returns**: "pong" text (fastest response)

### `/health/db` (Database)
- ✅ MongoDB connection state
- **Returns**: Connection status only

---

## 🚀 Your Health Check URLs

Based on your deployment:

### Production (Render):
```
https://wellnest-backend.onrender.com/health
https://wellnest-backend.onrender.com/ping
https://wellnest-backend.onrender.com/health/db
```

### Custom Domain (if configured):
```
https://api.wellnest.sbs/health
https://api.wellnest.sbs/ping
https://api.wellnest.sbs/health/db
```

---

## 🧪 Testing Your Health Endpoints

### Using cURL:
```bash
# Main health check
curl https://wellnest-backend.onrender.com/health

# Simple ping
curl https://wellnest-backend.onrender.com/ping

# Database check
curl https://wellnest-backend.onrender.com/health/db
```

### Using Browser:
Just visit: `https://wellnest-backend.onrender.com/health`

### Expected Response Times:
- `/ping` - 50-100ms
- `/health/db` - 100-200ms
- `/health` - 150-300ms

---

## 📈 Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Healthy | All systems operational ✅ |
| 503 | Unhealthy | Service degraded or down ⚠️ |
| 500 | Error | Internal server error ❌ |
| 404 | Not Found | Wrong URL |

---

## 🔍 Troubleshooting

### If Health Check Returns 503:
1. Check database connection (MongoDB Atlas)
2. Review Render logs
3. Verify environment variables
4. Check memory usage

### If Uptime Robot Shows Down:
1. Verify URL is correct
2. Check SSL certificate validity
3. Ensure Render service is running
4. Check if IP is blocked

### If Database Shows Disconnected:
1. Check MongoDB Atlas connection string
2. Verify network access (whitelist IPs)
3. Check database user credentials
4. Review MongoDB Atlas status

---

## 💡 Best Practices

1. **Use Multiple Monitors**:
   - Main health check for overall status
   - Ping for quick availability
   - Database check for data layer

2. **Set Appropriate Intervals**:
   - Critical services: 1-5 minutes
   - Non-critical: 10-30 minutes

3. **Configure Smart Alerts**:
   - Wait for 2-3 failed checks before alerting
   - Use different channels for different severity

4. **Monitor Response Times**:
   - Set up alerts if response time > 2 seconds
   - Track trends over time

5. **Regular Reviews**:
   - Check Uptime Robot dashboard weekly
   - Review downtime reports monthly
   - Optimize based on patterns

---

## 🎯 Quick Start Checklist

- [ ] Health endpoints deployed to production
- [ ] Uptime Robot account created
- [ ] Main health monitor configured
- [ ] Ping monitor configured (backup)
- [ ] Email alerts set up
- [ ] Slack notifications configured (optional)
- [ ] Test alerts by stopping service
- [ ] Document URLs for team

---

## 📞 Support

If health checks fail consistently:
1. Check Render deployment status
2. Review application logs
3. Verify MongoDB Atlas connection
4. Check environment variables

**Render Dashboard**: https://dashboard.render.com
**MongoDB Atlas**: https://cloud.mongodb.com
**Uptime Robot**: https://uptimerobot.com

---

**Status**: ✅ Ready to Deploy
**Last Updated**: December 15, 2025
