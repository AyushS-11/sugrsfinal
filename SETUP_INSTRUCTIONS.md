# SUGRS Project - Local Setup Guide

## Prerequisites
- Node.js v18+ (you have v20.20.0 ✅)
- npm (installed ✅)
- MongoDB (local or cloud)

## Option 1: Using MongoDB Atlas (Recommended - No Local Setup)

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/sugrs`)
4. Update `/Users/ayushsarode/Downloads/sugrs/backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sugrs
   ```
5. Save the file
6. Run: `npm run start-servers` (from root)

## Option 2: Using Local MongoDB via Docker

### Prerequisites:
- Install Docker Desktop from https://www.docker.com/products/docker-desktop

### Steps:
1. Start MongoDB container:
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

2. Backend will connect automatically to `mongodb://localhost:27017/sugrs`

3. Run: `npm run start-servers` (from root)

## Option 3: Using Local MongoDB (macOS)

### Install using Homebrew:
```bash
# Install MongoDB using Homebrew tap
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
mongo
```

## Quick Start (After MongoDB is Ready)

From the project root directory:

```bash
# Install all dependencies
npm install

# Start both backend and frontend servers
npm run start-servers
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Health Check**: http://localhost:8080/api/health

## Default Login Credentials

### Citizens:
- Email: `priya@sugrs.in` | Password: `citizen123`
- Email: `amit@sugrs.in` | Password: `citizen123`

### Officers:
- Email: `rajan@sugrs.in` | Password: `officer123`
- Email: `neha@sugrs.in` | Password: `officer123`

### Admin:
- Email: `admin@sugrs.in` | Password: `admin123`

## Available Scripts

```bash
# From root
npm run start-servers       # Start both backend and frontend

# From backend directory
npm run dev                 # Start with nodemon (auto-restart on changes)
npm start                   # Start production server

# From frontend directory
npm run dev                 # Start Vite dev server
npm run build               # Build for production
npm run preview             # Preview production build
```

## Troubleshooting

### MongoDB Connection Timeout
- Ensure MongoDB is running
- Check if port 27017 is available
- Use MongoDB Atlas as cloud alternative

### Frontend won't load
- Check if port 5173 is available
- Verify `npm install` completed without errors
- Try clearing `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Permission Denied Errors
```bash
# Fix node_modules permissions
chmod +x ./node_modules/.bin/*
```

## Project Structure
- `/backend` - Express.js server with Mongoose/MongoDB
- `/frontend` - React + Vite application
- `/backend/models` - MongoDB schemas
- `/backend/routes` - API endpoints
- `/backend/lib` - Service layer (AI, Blockchain, etc.)

## Features Included
✅ Citizen complaint registration
✅ Officer complaint resolution
✅ Real-time notifications via WebSocket
✅ AI Chat with Google Gemini
✅ Blockchain audit logging
✅ Analytics dashboard
✅ Role-based access control


