cd # ✅ SUGRS Setup Checklist

## Pre-Run Checklist

### ✅ Dependencies
- [x] Root dependencies installed (`npm install`)
- [x] Backend dependencies installed (`cd backend && npm install`)
- [x] Frontend dependencies installed (`cd frontend && npm install`)
- [x] Concurrently package installed (for running both servers)

### ✅ Configuration
- [x] Backend .env configured (PORT, API keys, etc.)
- [x] Frontend auto-configured
- [x] MongoDB connection string ready

### ✅ Documentation
- [x] QUICKSTART.md created
- [x] README.md created
- [x] SETUP_INSTRUCTIONS.md created
- [x] SETUP_COMPLETE.md created
- [x] FILES_CREATED.md created
- [x] START_HERE.sh created
- [x] setup-mongodb.sh created
- [x] .env.example created

### ✅ Scripts
- [x] Root package.json updated with npm scripts
- [x] setup-mongodb.sh made executable
- [x] START_HERE.sh made executable

### ✅ Database
- [ ] MongoDB running (choose one setup method)

### ✅ Application
- [ ] Backend started (http://localhost:8080)
- [ ] Frontend started (http://localhost:5173)
- [ ] Successfully logged in

---

## MongoDB Setup Options

Choose ONE and complete:

### Option 1: Docker ⭐ (Easiest)
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```
- [ ] Command executed
- [ ] MongoDB running (`docker ps | grep mongodb`)

### Option 2: Homebrew (macOS)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```
- [ ] Homebrew tap added
- [ ] MongoDB installed
- [ ] Service started (`brew services list`)

### Option 3: MongoDB Atlas (Cloud)
- [ ] Account created at https://mongodb.com/cloud/atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string copied
- [ ] backend/.env updated with MONGODB_URI

### Option 4: Interactive Setup
```bash
./setup-mongodb.sh
```
- [ ] Script executed
- [ ] MongoDB setup completed

---

## Start Application

### Run Command
```bash
npm run start-servers
```

### Verify Backend
- [ ] Process running on port 8080
- [ ] Logs show "🏛️ SUGRS Backend → http://localhost:8080"
- [ ] API responds: `curl http://localhost:8080/api/health`

### Verify Frontend
- [ ] Process running on port 5173
- [ ] Vite dev server started
- [ ] http://localhost:5173 loads in browser

---

## Test Login

### Open Browser
```
http://localhost:5173
```

### Test Citizen Account
- Email: `priya@sugrs.in`
- Password: `citizen123`
- [ ] Login successful
- [ ] Dashboard visible

### Test Officer Account
- Email: `rajan@sugrs.in`
- Password: `officer123`
- [ ] Login successful
- [ ] Officer dashboard visible

### Test Admin Account
- Email: `admin@sugrs.in`
- Password: `admin123`
- [ ] Login successful
- [ ] Admin dashboard visible

---

## Application Features - Quick Test

After logging in, test these features:

### Citizen Dashboard
- [ ] View home/dashboard
- [ ] File new complaint
- [ ] View my complaints
- [ ] Track status
- [ ] Add feedback

### Officer Dashboard
- [ ] View assigned complaints
- [ ] Update complaint status
- [ ] Add notes to complaint
- [ ] Resolve complaint

### Admin Dashboard
- [ ] View analytics
- [ ] View heatmap
- [ ] Manage officers
- [ ] View escalations

### Real-time Features
- [ ] Notifications appear in real-time
- [ ] Chat with AI (if configured)
- [ ] File uploads work

---

## Troubleshooting Checklist

If something doesn't work:

### MongoDB Not Connecting
- [ ] Check if MongoDB is running
- [ ] Run: `docker ps | grep mongodb` (Docker)
- [ ] Run: `brew services list` (Homebrew)
- [ ] Check MONGODB_URI in backend/.env
- [ ] Test MongoDB connection locally

### Port Already in Use
- [ ] Check what's using port 8080: `lsof -i :8080`
- [ ] Check what's using port 5173: `lsof -i :5173`
- [ ] Kill process: `lsof -ti:8080 | xargs kill -9`

### Module Not Found
- [ ] Run: `npm install` from affected directory
- [ ] Clear: `rm -rf node_modules && npm install`
- [ ] Check: Node version (need v18+)

### Permission Denied
- [ ] Run: `chmod +x ./node_modules/.bin/*`
- [ ] Check file ownership: `ls -la backend/.env`

### Frontend Not Loading
- [ ] Check console errors (F12)
- [ ] Verify backend is running: `curl http://localhost:8080/api/health`
- [ ] Check Vite output for errors
- [ ] Try port 5173 directly

---

## Commands Reference

```bash
# Directory: /Users/ayushsarode/Downloads/sugrs

# Installation
npm install              # Install root dependencies
npm run install-all      # Install all (root + backend + frontend)

# Running
npm run start-servers    # Start backend + frontend (production)
npm run dev              # Start with hot reload (development)
npm run backend          # Start only backend
npm run backend:dev      # Backend with auto-restart
npm run frontend         # Start only frontend
npm run build            # Build frontend for production

# Testing
curl http://localhost:8080/api/health    # Test backend
curl http://localhost:8080/api/auth      # Test auth routes

# Stopping
# Ctrl+C in terminal running servers

# Cleaning
rm -rf node_modules && npm install       # Clean reinstall
```

---

## Success Indicators

When everything is set up correctly:

✅ **Terminal Output:**
```
> Backend shows: "🏛️  SUGRS Backend → http://localhost:8080"
> Frontend shows: "VITE v5.x.x ready in x ms"
```

✅ **Browser:**
```
http://localhost:5173 loads the login page
Geolocation permission dialog may appear (normal)
```

✅ **API Test:**
```bash
curl http://localhost:8080/api/health
# Returns: {"status":"ok"}
```

✅ **Database:**
```
MongoDB connected and data seeded
Test accounts available for login
```

---

## Final Checklist Before Development

- [ ] All steps above completed
- [ ] Application running locally
- [ ] Login working with test account
- [ ] README.md reviewed
- [ ] Familiar with npm commands
- [ ] Understood project structure

---

## Next: Start Developing! 🚀

You're all set! Now you can:

1. **Explore** - Try different features with test accounts
2. **Understand** - Read README.md to learn about the system
3. **Modify** - Change code and see hot-reload in action
4. **Contribute** - Add features or fix bugs
5. **Deploy** - See README.md for deployment guide

Happy coding! ✨

---

**Completed on:** February 27, 2026
**Project:** SUGRS - Smart Urban Grievance Resolution System
**Status:** ✅ Ready for Local Development


