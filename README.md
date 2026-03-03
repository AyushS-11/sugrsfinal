# 🏛️ SUGRS - Smart Urban Grievance Resolution System

## Quick Start (5 minutes)

### Step 1: Set Up MongoDB

Choose one option:

#### Option A: Docker (Easiest)
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```
Then you're done! MongoDB is running.

#### Option B: Interactive Setup Script
```bash
./setup-mongodb.sh
```

#### Option C: MongoDB Atlas (Cloud - No Setup Needed)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Copy connection string
4. Update `backend/.env` with `MONGODB_URI=mongodb+srv://...`

### Step 2: Start the Application

```bash
# From project root
npm run start-servers
```

This starts:
- ✅ Backend API: http://localhost:8080
- ✅ Frontend App: http://localhost:5173

### Step 3: Login

Use any of these credentials:

**Citizens:**
- priya@sugrs.in / citizen123
- amit@sugrs.in / citizen123

**Officers:**
- rajan@sugrs.in / officer123
- neha@sugrs.in / officer123

**Admin:**
- admin@sugrs.in / admin123

---

## Available Commands

### Root Directory
```bash
npm run install-all        # Install all dependencies
npm run start-servers      # Start backend + frontend (production)
npm run dev                # Start backend + frontend (development with hot reload)
npm run backend            # Start only backend
npm run backend:dev        # Start backend with nodemon
npm run frontend           # Start only frontend
npm run build              # Build frontend for production
```

### Backend Directory
```bash
cd backend
npm start                  # Production mode
npm run dev               # Development mode (auto-restart on changes)
```

### Frontend Directory
```bash
cd frontend
npm run dev               # Vite dev server with hot reload
npm run build             # Build for production
npm run preview           # Preview production build
```

---

## Project Structure

```
sugrs/
├── backend/               # Express.js + MongoDB API
│   ├── routes/           # API endpoints
│   ├── models/           # MongoDB schemas
│   ├── lib/              # Services (AI, Blockchain, etc.)
│   ├── middleware/       # Auth middleware
│   ├── uploads/          # File uploads
│   ├── server.js         # Main server
│   ├── db.js             # Database connection
│   └── .env              # Configuration
│
├── frontend/             # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── features/     # Feature modules
│   │   ├── api/          # API client
│   │   └── context/      # React context
│   └── vite.config.js    # Vite configuration
│
└── SETUP_INSTRUCTIONS.md # Detailed setup guide
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Complaints
- `GET /api/complaints` - List all complaints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint

### Officers
- `GET /api/officers` - List all officers
- `PUT /api/officers/:id/assign` - Assign complaint to officer

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/heatmap` - Complaint heatmap data

### AI Chat
- `POST /api/ai/chat` - Chat with AI assistant

### Notifications
- `GET /api/notifications` - Get user notifications
- `WebSocket: ws://localhost:8080` - Real-time notifications

### Audit Log
- `GET /api/audit` - Blockchain audit logs

---

## Features

✅ **Citizen Portal**
- Register complaints
- Track complaint status
- View complaint history
- Rate feedback on resolution
- View community contributions

✅ **Officer Dashboard**
- View assigned complaints
- Update complaint status
- Add notes and timeline
- Resolve complaints
- Rate citizen cooperation

✅ **Supervisor Dashboard**
- Analytics and insights
- Officer performance metrics
- Complaint heatmap
- Escalations management
- Merge duplicate tickets
- Merge merge complaints

✅ **AI Features**
- Chatbot assistance
- Smart ticket categorization
- Complaint analysis

✅ **Security**
- JWT authentication
- Role-based access control
- Blockchain audit logging
- Complaint history tracking

✅ **Real-time**
- WebSocket notifications
- Live status updates
- Instant message delivery

---

## Environment Variables

### Backend (.env)
```
PORT=8080
MONGODB_URI=mongodb://localhost:27017/sugrs
GEMINI_API_KEY=your_gemini_api_key
FAST2SMS_API_KEY=your_fast2sms_key (optional)
```

### Frontend (auto-configured)
- Backend API: http://localhost:8080

---

## Troubleshooting

### MongoDB Connection Timeout
```
Error: Operation `users.countDocuments()` buffering timed out
```
**Solution:** Ensure MongoDB is running
```bash
# If using Docker:
docker ps | grep mongodb

# If using Homebrew:
brew services list | grep mongodb
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:** Kill existing process
```bash
lsof -ti:8080 | xargs kill -9   # Backend
lsof -ti:5173 | xargs kill -9   # Frontend
```

### Module Not Found
```
npm ERR! code ERESOLVE
```
**Solution:** Clear and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied on node_modules
```bash
chmod +x ./node_modules/.bin/*
```

---

## Development Tips

### Hot Reload
- **Backend:** Run `npm run dev` in backend directory (uses nodemon)
- **Frontend:** Vite automatically hot-reloads changes

### Database Reset
```bash
# Delete and recreate database (MongoDB)
# Connect to MongoDB and run:
use sugrs
db.dropDatabase()
```

### Debug Mode
```bash
# Backend with inspector
node --inspect server.js

# Frontend with Vue/React DevTools browser extension
```

### View Logs
```bash
# Backend logs
tail -f backend/logs.txt

# Docker logs
docker logs -f mongodb
```

---

## Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output: dist/ folder ready for hosting
```

### Deploy Backend
```bash
# Set environment variables on server
export MONGODB_URI=...
export GEMINI_API_KEY=...

# Start server
cd backend
npm install --production
npm start
```

---

## Performance Tips

1. **Frontend:** Production build minifies and optimizes assets
2. **Backend:** Use production mode with process managers (PM2)
3. **Database:** Add indexes on frequently queried fields
4. **Caching:** WebSocket reduces repeated API calls

---

## Support & Docs

- 📖 [Full Setup Instructions](./SETUP_INSTRUCTIONS.md)
- 🤖 [AI Features](./backend/routes/ai.js)
- 🔐 [Security](./backend/middleware/authMiddleware.js)
- 📊 [Analytics](./backend/routes/analytics.js)

---

## License

MIT License - See LICENSE file for details

---

## Contributors

Built with ❤️ for Better Governance


