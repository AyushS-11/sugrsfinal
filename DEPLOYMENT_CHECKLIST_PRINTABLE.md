# ✅ SUGRS DEPLOYMENT CHECKLIST - PRINTABLE

**Project:** Smart Urban Grievance Resolution System (SUGRS)  
**Status:** Production Ready  
**Date:** March 3, 2026  

---

## BEFORE YOU START

- [ ] Read `00_START_HERE.md` or `QUICK_DEPLOY_GUIDE.md`
- [ ] GitHub account created
- [ ] Vercel account created
- [ ] MongoDB Atlas account created
- [ ] Google Gemini API signup done

---

## STEP 1: PREPARE GITHUB

- [ ] Open terminal in project directory
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "SUGRS production ready"`
- [ ] Run: `git push origin main`
- [ ] Verify files in GitHub dashboard

---

## STEP 2: GET API KEYS

### MongoDB Atlas
- [ ] Go to: mongodb.com/cloud/atlas
- [ ] Create free account
- [ ] Create new project
- [ ] Build M0 cluster (free)
- [ ] Create database user
- [ ] Allow network access (0.0.0.0/0)
- [ ] Copy connection string
- [ ] Replace `<username>` and `<password>`
- [ ] Save: `mongodb+srv://user:pass@cluster.mongodb.net/sugrs`

### Google Gemini API
- [ ] Go to: ai.google.dev
- [ ] Click "Get API Key"
- [ ] Create new project if needed
- [ ] Copy API key
- [ ] Save: `AIza...`

### Fast2SMS (Optional)
- [ ] Go to: fast2sms.com
- [ ] Create account
- [ ] Go to Dashboard → Dev API
- [ ] Copy API key
- [ ] Save: `...`

---

## STEP 3: DEPLOY BACKEND

### Create Vercel Project
- [ ] Go to: vercel.com/new
- [ ] Select your GitHub repository
- [ ] Choose project name: `sugrs-backend`
- [ ] Set Root Directory: `./backend`
- [ ] Click "Continue"

### Add Environment Variables
- [ ] Click "Environment Variables"
- [ ] Add: `MONGODB_URI` = `mongodb+srv://...`
- [ ] Add: `GEMINI_API_KEY` = `AIza...`
- [ ] Add: `FAST2SMS_API_KEY` = `...` (optional)
- [ ] Add: `NODE_ENV` = `production`
- [ ] Click "Deploy"

### Verify Deployment
- [ ] Wait for deployment to complete
- [ ] Check build logs for errors
- [ ] Copy backend URL (e.g., `sugrs-backend.vercel.app`)
- [ ] Test: `https://sugrs-backend.vercel.app/api/health`
- [ ] Should return: `{"status":"ok"}`

---

## STEP 4: DEPLOY FRONTEND

### Create Vercel Project
- [ ] Go to: vercel.com/new
- [ ] Select your GitHub repository
- [ ] Choose project name: `sugrs-frontend`
- [ ] Set Root Directory: `./frontend`
- [ ] Click "Continue"

### Add Environment Variables
- [ ] Click "Environment Variables"
- [ ] Add: `VITE_API_BASE_URL` = `https://sugrs-backend.vercel.app`
  (Use your actual backend URL from Step 3)
- [ ] Click "Deploy"

### Verify Deployment
- [ ] Wait for deployment to complete
- [ ] Check build logs for errors
- [ ] Copy frontend URL (e.g., `sugrs-frontend.vercel.app`)
- [ ] Click "Visit" to open your app
- [ ] App should load successfully

---

## STEP 5: TEST PRODUCTION

### Login Test
- [ ] Open your frontend URL
- [ ] Click "Officer Login" or "Supervisor Login"
- [ ] Try: `rajan@sugrs.in` / `officer123`
- [ ] Should login successfully
- [ ] Should see officer dashboard

### Page Navigation
- [ ] [ ] Click: Landing page - loads
- [ ] [ ] Click: File Complaint - shows form
- [ ] [ ] Click: Track Complaint - shows search
- [ ] [ ] Click: Map - shows complaint heatmap
- [ ] [ ] Click: AI Assistant - shows chatbot

### Feature Test
- [ ] [ ] AI classification works
- [ ] [ ] Map displays correctly
- [ ] [ ] Charts display data
- [ ] [ ] Forms submit successfully
- [ ] [ ] No console errors (F12)

---

## STEP 6: MONITORING

### Check Logs
- [ ] Go to Vercel Dashboard
- [ ] Click: Backend project → Deployments → Logs
- [ ] Check for any errors
- [ ] Go to Frontend project → same
- [ ] Check for any errors

### Setup Alerts (Optional)
- [ ] Enable Vercel Analytics
- [ ] Enable error notifications
- [ ] Set up performance alerts
- [ ] Monitor first 24 hours

### Database Check
- [ ] Go to MongoDB Atlas Dashboard
- [ ] Check connection status
- [ ] Verify data is being stored
- [ ] Monitor performance

---

## TROUBLESHOOTING

### If Backend Won't Deploy
- [ ] Check build logs for errors
- [ ] Verify environment variables are set
- [ ] Ensure MongoDB URI is correct
- [ ] Try redeploying

### If Frontend Won't Deploy
- [ ] Check build logs for errors
- [ ] Verify VITE_API_BASE_URL is correct
- [ ] Make sure frontend root is `./frontend`
- [ ] Try redeploying

### If Login Fails
- [ ] Check backend health endpoint
- [ ] Verify backend URL is correct
- [ ] Check MongoDB connection
- [ ] Check backend logs

### If Pages Are Blank
- [ ] Check browser console (F12)
- [ ] Verify frontend loads
- [ ] Check for API errors
- [ ] Try hard refresh (Ctrl+Shift+R)

---

## DOCUMENTATION REFERENCE

**Need Help?**
| Question | File |
|----------|------|
| What happened? | COMPLETION_SUMMARY.md |
| How do I deploy? | DEPLOYMENT.md |
| Is it working? | TESTING.md |
| What changed? | DEPLOYMENT_READINESS_REPORT.md |
| Am I ready? | PRE_DEPLOYMENT_CHECKLIST.md |
| Quick reference? | QUICK_DEPLOY_GUIDE.md |

---

## SUCCESS INDICATORS

✅ You're done when:
- [ ] Backend URL is accessible
- [ ] Frontend URL is accessible
- [ ] Can login successfully
- [ ] All pages load without errors
- [ ] API endpoints responding
- [ ] Database operations working
- [ ] No errors in Vercel logs
- [ ] No errors in browser console

---

## SECURITY CHECKLIST

- [ ] HTTPS enabled (automatic)
- [ ] API keys NOT in code
- [ ] API keys in Vercel env vars
- [ ] .env files NOT in git
- [ ] Database password is strong
- [ ] Network access restricted to Vercel
- [ ] 2FA enabled on accounts (optional)

---

## CUSTOM DOMAIN (Optional)

After successful deployment:
- [ ] Buy domain from registrar
- [ ] Go to Vercel → Project → Settings → Domains
- [ ] Add custom domain
- [ ] Follow DNS configuration
- [ ] Wait for DNS propagation (up to 48h)

---

## NEXT STEPS AFTER DEPLOYMENT

1. [ ] Monitor logs daily for errors
2. [ ] Check analytics for performance
3. [ ] Backup database regularly
4. [ ] Rotate API keys periodically
5. [ ] Update documentation
6. [ ] Add more features
7. [ ] Scale as needed

---

## SUPPORT

**Questions?**
- Check: DOCUMENTATION_INDEX.md
- Search: Use Ctrl+F in docs
- Logs: Vercel Dashboard
- Errors: Browser console (F12)

**Common Issues:**
- Check: QUICK_DEPLOY_GUIDE.md (Common Issues section)
- Check: DEPLOYMENT.md (Troubleshooting section)

---

## SIGN-OFF

**I have completed:**
- [ ] All preparation steps
- [ ] Deployment to Vercel
- [ ] Testing in production
- [ ] Monitoring setup

**Date Deployed:** ________________

**Deployed By:** ________________

**Notes:** ________________________________________

________________________________________

---

## EMERGENCY ROLLBACK

If something breaks:
1. Go to Vercel Dashboard
2. Click: Your Project → Deployments
3. Find: Last working deployment
4. Click: "Redeploy" or "Promote to Production"
5. Wait for redeployment

---

**Status:** ✅ READY TO DEPLOY

**Your SUGRS application is production-ready!**

**Print this checklist and follow the steps! 🚀**

---

*Generated: March 3, 2026*  
*Version: 1.0.0*  
*Project Status: COMPLETE*

