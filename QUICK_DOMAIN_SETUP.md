# Quick Setup Checklist for wellnest.sbs

## 1. DNS Configuration (Do First)
Go to your domain registrar and add these records:

```
Type: CNAME | Name: www  | Value: cname.vercel-dns.com
Type: CNAME | Name: api  | Value: [your-render-app].onrender.com
Type: A     | Name: @    | Value: 76.76.21.21
```

**Find your Render app name:**
- Go to https://dashboard.render.com/
- Copy your service URL (e.g., `wellnest-backend-abc123.onrender.com`)
- Use that as the CNAME value for `api`

---

## 2. Vercel Setup (Frontend)
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Domains
3. Add: `www.wellnest.sbs` and `wellnest.sbs`
4. Go to Settings → Environment Variables
5. Set: `VITE_API_URL` = `https://api.wellnest.sbs`
6. Redeploy from Deployments tab

---

## 3. Render Setup (Backend)
1. Go to https://dashboard.render.com/
2. Select your service → Settings
3. Add Custom Domain: `api.wellnest.sbs`
4. Commit and push the CORS changes (already done in code)

---

## 4. Test Everything
- Frontend: https://www.wellnest.sbs
- Backend: https://api.wellnest.sbs
- Login and try features

**DNS propagation takes 5 minutes to 48 hours. Check status at: https://dnschecker.org/**
