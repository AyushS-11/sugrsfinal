# 🚀 SUGRS - Vercel Deployment Guide

This guide walks you through deploying SUGRS (Smart Urban Grievance Resolution System) on Vercel.

## Prerequisites

1. **GitHub Account** - Your project must be on GitHub
2. **MongoDB Atlas Account** - For cloud database (Free tier available)
3. **Vercel Account** - Connected to your GitHub
4. **Environment Variables** - API keys for Google Gemini and Fast2SMS

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

### Why MongoDB Atlas?
- Free tier supports up to 512MB storage
- No local database setup needed
- Vercel can connect to it from anywhere

### Setup:
1. Go to **https://www.mongodb.com/cloud/atlas**
2. Sign up for a free account
3. Create a new Project
4. Build a **Free Cluster** (M0)
5. Create a Database User:
   - Go to "Database Access" → Add New Database User
   - Username: `sugrs_admin`
   - Password: Generate a strong password, save it!
6. Allow Network Access:
   - Go to "Network Access" → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - **Note:** In production, restrict to Vercel's IP ranges
7. Get Connection String:
   - Go to "Databases" → Connect → Drivers
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials
   - Example: `mongodb+srv://sugrs_admin:YOUR_PASSWORD@cluster0.mongodb.net/sugrs`

---

## Step 2: Prepare for Deployment

### 2.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: SUGRS ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/sugrs.git
git push -u origin main
```

### 2.2 Create .env Files for Vercel

#### Backend Environment Variables
In your Vercel dashboard, add these for the backend:

```
PORT=3001
MONGODB_URI=mongodb+srv://sugrs_admin:YOUR_PASSWORD@cluster0.mongodb.net/sugrs
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FAST2SMS_API_KEY=YOUR_FAST2SMS_KEY
NODE_ENV=production
```

**How to get these keys:**
- **GEMINI_API_KEY**: Get free key from https://ai.google.dev
- **FAST2SMS_API_KEY**: Get free key from https://www.fast2sms.com (optional, can leave empty)
- **MONGODB_URI**: From MongoDB Atlas (Step 1)

#### Frontend Environment Variables
In your Vercel dashboard, add these for the frontend:

```
VITE_API_BASE_URL=https://sugrs-backend.vercel.app
```

Replace `sugrs-backend` with your actual backend Vercel project name.

---

## Step 3: Deploy on Vercel

### Option A: Deploy Backend First (Recommended)

1. **Create a new Vercel project:**
   - Go to **https://vercel.com/new**
   - Select your GitHub repository
   - Choose **Project Name**: `sugrs-backend`
   - **Root Directory**: `./backend`

2. **Add Environment Variables:**
   - In Project Settings → Environment Variables
   - Add all backend variables from Step 2.2

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your backend URL: `https://sugrs-backend.vercel.app`

### Option B: Deploy Frontend

1. **Update VITE_API_BASE_URL:**
   - Use your backend URL from Option A
   - Example: `https://sugrs-backend.vercel.app`

2. **Create a new Vercel project:**
   - Go to **https://vercel.com/new**
   - Select your GitHub repository
   - Choose **Project Name**: `sugrs-frontend`
   - **Root Directory**: `./frontend`

3. **Add Environment Variables:**
   - In Project Settings → Environment Variables
   - Add: `VITE_API_BASE_URL=https://sugrs-backend.vercel.app`

4. **Deploy:**
   - Click "Deploy"
   - Your frontend will be live at `https://sugrs-frontend.vercel.app`

---

## Step 4: Test Your Deployment

### Test Endpoints:

1. **Backend Health:**
   ```bash
   curl https://sugrs-backend.vercel.app/api/health
   ```
   Expected: `{"status":"ok"}`

2. **Login:**
   ```bash
   curl -X POST https://sugrs-backend.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"rajan@sugrs.in","password":"officer123"}'
   ```

3. **Get Complaints:**
   ```bash
   curl https://sugrs-backend.vercel.app/api/complaints \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Test Frontend:

1. Open **https://sugrs-frontend.vercel.app**
2. Try logging in with:
   - Email: `rajan@sugrs.in`
   - Password: `officer123`
3. Navigate through pages to verify they load correctly

---

## Step 5: Custom Domain (Optional)

1. **Buy a domain** from Namecheap, GoDaddy, etc.
2. **Add to Vercel:**
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions
   - Example:
     - Frontend: `app.yourdomain.com`
     - Backend: `api.yourdomain.com`

---

## Common Issues & Solutions

### ❌ "CORS error" when frontend calls backend

**Cause:** Backend CORS not configured for your frontend domain

**Solution:** Update backend `server.js`:
```javascript
app.use(cors({ 
    origin: ['https://sugrs-frontend.vercel.app', 'https://yourdomain.com'],
    credentials: true 
}));
```

### ❌ "Cannot connect to MongoDB"

**Possible causes:**
1. MongoDB URI is incorrect
2. Network access not allowed in MongoDB Atlas
3. Database user password contains special characters

**Solution:**
- Verify connection string in MongoDB Atlas
- Ensure IP whitelist includes `0.0.0.0/0` (or Vercel's IPs)
- Encode special characters in password (e.g., `@` → `%40`)

### ❌ "API request timeout (504)"

**Cause:** Function execution time exceeded 10 seconds

**Solution:**
- Optimize database queries
- Add pagination to large data fetches
- Consider upgrading Vercel plan for longer timeouts

### ❌ "Files not found in uploads folder"

**Cause:** Vercel serverless functions have ephemeral storage

**Solution:**
- Use cloud storage (AWS S3, Cloudinary)
- Or store file URLs in database instead of files
- Update `backend/server.js`:
```javascript
// Option 1: Use AWS S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Option 2: Use Cloudinary
const cloudinary = require('cloudinary').v2;
```

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `PORT=3001`
- [ ] `MONGODB_URI=mongodb+srv://...`
- [ ] `GEMINI_API_KEY=AIza...`
- [ ] `FAST2SMS_API_KEY=...` (optional)
- [ ] `NODE_ENV=production`

### Frontend (.env.local)
- [ ] `VITE_API_BASE_URL=https://sugrs-backend.vercel.app`

---

## Monitoring & Logs

1. **View Logs:**
   - Vercel Dashboard → Your Project → Deployments → Logs
   - Or use Vercel CLI: `vercel logs`

2. **Monitor Performance:**
   - Vercel Analytics → Performance
   - Check response times and errors

3. **Database Monitoring:**
   - MongoDB Atlas → Cluster → Monitoring
   - Check connection counts and query performance

---

## Security Best Practices

1. ✅ **Never commit .env files** - Use `.gitignore`
2. ✅ **Use strong database passwords**
3. ✅ **Restrict MongoDB IP access** to Vercel's IPs in production
4. ✅ **Enable HTTPS** (automatic with Vercel)
5. ✅ **Rotate API keys regularly**
6. ✅ **Use environment variables for all secrets**
7. ✅ **Enable 2FA on GitHub, MongoDB, and Vercel**

---

## Performance Tips

1. **Frontend Optimization:**
   - Enable Vercel's Edge Cache
   - Use image optimization
   - Enable automatic code splitting

2. **Backend Optimization:**
   - Add database indexes
   - Implement caching
   - Optimize MongoDB queries
   - Use connection pooling

3. **Monitor:**
   - Set up alerts in MongoDB Atlas
   - Monitor Vercel Analytics
   - Check error logs daily

---

## Rollback Instructions

If a deployment breaks:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the last working deployment
3. Click "Redeploy"
4. Or click "Promote to Production"

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Gemini API Docs:** https://ai.google.dev
- **SUGRS Issues:** Create an issue in your GitHub repo

---

## Next Steps

1. Deploy backend on Vercel ✓
2. Deploy frontend on Vercel ✓
3. Configure custom domain (optional) ✓
4. Set up monitoring ✓
5. Configure backups for MongoDB ✓

**Congrats! Your SUGRS system is now live! 🎉**

