# 🚀 SUGRS - Quick Start Guide

## What You Need to Do

Your project is **ready to run** on localhost! Follow these 3 simple steps:

---

## STEP 1: Set Up MongoDB (Choose ONE option)

### ⭐ **Option A: Docker** (Easiest)
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```
**Done!** MongoDB is now running locally.

---

### ☁️ **Option B: MongoDB Atlas** (Cloud - Recommended if no local setup)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Create a database user
5. Allow network access
6. Copy connection string
7. Edit `backend/.env` and replace:
   ```
   MONGODB_URI=mongodb+srv://yourUsername:yourPassword@yourCluster.mongodb.net/sugrs
   ```

---

### 📦 **Option C: Homebrew** (macOS)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## STEP 2: Start the Application

From the **project root** (`/Users/ayushsarode/Downloads/sugrs`):

```bash
npm run start-servers
```

**This will start:**
- ✅ Backend API: `http://localhost:8080`
- ✅ Frontend App: `http://localhost:5173`

---

## STEP 3: Login & Test

Open **http://localhost:5173** and login with:

**Citizen Account:**
- Email: `priya@sugrs.in`
- Password: `citizen123`

**Officer Account:**
- Email: `rajan@sugrs.in`
- Password: `officer123`

**Admin Account:**
- Email: `admin@sugrs.in`
- Password: `admin123`

---

## 🎯 That's It!

Your SUGRS application is now running on localhost! 🎉

---

## Useful Commands

```bash
# Start with hot reload (auto-restart on changes)
npm run dev

# Start only backend
npm run backend

# Start only frontend
cd frontend && npm run dev

# Check health
curl http://localhost:8080/api/health

# Stop servers
# Press Ctrl+C in the terminal
```

---

## ⚠️ Common Issues & Solutions

### "MongoDB connection timeout"
**Solution:** Make sure MongoDB is running
```bash
# If using Docker:
docker ps | grep mongodb

# If using Homebrew:
brew services list
```

### "Port 5173 already in use"
**Solution:** Kill the existing process
```bash
lsof -ti:5173 | xargs kill -9
```

### "Port 8080 already in use"
**Solution:** Kill the backend process
```bash
lsof -ti:8080 | xargs kill -9
```

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

---

## 📚 More Information

- See `README.md` for complete documentation
- See `SETUP_INSTRUCTIONS.md` for detailed setup
- Run `./setup-mongodb.sh` for interactive MongoDB setup

---

## 🏗️ Project Structure

```
sugrs/
├── backend/         ← Express.js API server
├── frontend/        ← React + Vite app
├── README.md        ← Full documentation
├── SETUP_INSTRUCTIONS.md
└── setup-mongodb.sh ← MongoDB setup script
```

---

## 🔐 Features Included

✅ Citizen complaint registration & tracking
✅ Officer complaint resolution
✅ Admin dashboard & analytics
✅ Real-time notifications (WebSocket)
✅ AI chatbot assistance (Google Gemini)
✅ Blockchain audit logging
✅ Role-based access control
✅ File uploads & attachments
✅ SMS notifications
✅ Heatmap visualization

---

**Happy coding!** 🚀


