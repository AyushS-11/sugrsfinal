# 🏛️ SUGRS - Smart Urban Grievance Resolution System

**A modern, full-stack web application for managing urban grievances and complaints with AI-powered classification, real-time tracking, and comprehensive analytics.**

## 📸 Features

### 🌟 Public Features
- **File Complaint** - Submit complaints with GPS location, AI classification, and image uploads
- **Track Complaint** - Real-time tracking with status updates and timeline
- **Transparency Dashboard** - Public analytics on complaint resolution rates
- **Interactive Heatmap** - Visualize complaint density across the city
- **AI Assistant** - Chat-based grievance filing with Gemini API integration
- **Citizen Feedback** - Rate and review complaint resolution
- **Multi-language Support** - English, Hindi, Marathi, Tamil, Telugu

### 👮 Officer Features
- **Complaint Queue** - View and manage assigned complaints
- **Quick Resolution** - Update status, add notes, and close tickets
- **Real-time Notifications** - WebSocket-based live updates
- **Performance Dashboard** - Track resolution metrics

### 👨‍💼 Supervisor/Admin Features
- **Advanced Analytics** - Comprehensive complaint data visualization
- **Officer Accountability** - Performance scoring and leaderboard
- **Duplicate Detection** - AI-powered ticket merging
- **Escalations** - Manage high-priority and delayed complaints
- **Department Management** - Oversee officers and workload distribution
- **Audit Logs** - Track all system activity

### 🤖 Technology Stack

**Frontend:**
- React 18
- Vite (fast bundler)
- Tailwind CSS
- React Router v7
- Leaflet for maps
- Axios for API calls

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- Google Gemini API (AI classification)
- JWT Authentication
- WebSocket for real-time updates
- Fast2SMS for notifications

**Deployment:**
- Vercel (Frontend & Serverless Backend)
- MongoDB Atlas (Cloud Database)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)
- Google Gemini API key
- Git

### Local Development (5 minutes)

```bash
# Clone and navigate
git clone <your-repo>
cd sugrs

# Install dependencies
npm run install-all

# For MongoDB, choose one option:

# Option 1: Docker (Easiest)
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Option 2: Homebrew (macOS)
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Option 3: MongoDB Atlas (Cloud - Recommended)
# Go to https://www.mongodb.com/cloud/atlas
# Create account → cluster → get connection string
# Update backend/.env with MONGODB_URI

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env with your API keys:
# - GEMINI_API_KEY (from https://ai.google.dev)
# - MONGODB_URI (from MongoDB Atlas or local)
# - FAST2SMS_API_KEY (optional, from https://www.fast2sms.com)

# Start development servers
npm run start-servers
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

### Test Credentials

**Officer:**
- Email: `rajan@sugrs.in`
- Password: `officer123`

**Supervisor/Admin:**
- Email: `admin@sugrs.in`
- Password: `admin123`

**Citizen:**
- Email: `priya@sugrs.in`
- Password: `citizen123`

---

## 📦 Project Structure

```
sugrs/
├── backend/                    # Express.js API server
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Feedback.js
│   │   ├── AuditLog.js
│   │   └── CivicAction.js
│   ├── routes/                 # API endpoints
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── ai.js
│   │   ├── analytics.js
│   │   ├── officers.js
│   │   ├── audit.js
│   │   ├── civic.js
│   │   ├── notifications.js
│   │   └── feedback.js
│   ├── lib/                    # Business logic
│   │   ├── criticalDetector.js
│   │   ├── duplicateDetector.js
│   │   ├── notificationEngine.js
│   │   └── auditService.js
│   ├── middleware/             # Auth & validation
│   ├── server.js               # Express app
│   ├── db.js                   # MongoDB connection & seed
│   ├── package.json
│   ├── .env                    # Environment variables
│   └── vercel.json             # Vercel config
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── public/         # Public pages (no auth)
│   │   │   ├── auth/           # Login pages
│   │   │   ├── officer/        # Officer dashboard pages
│   │   │   └── supervisor/     # Supervisor/admin pages
│   │   ├── components/         # Reusable components
│   │   │   ├── index.jsx       # UI components & icons
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── ChatbotWidget.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── features/           # Feature components
│   │   │   └── Heatmap.jsx
│   │   ├── context/            # Auth & theme context
│   │   ├── api/                # API client
│   │   │   └── client.js       # Axios instance with interceptors
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── package.json
│   ├── .env.local              # Frontend environment variables
│   └── vercel.json             # Vercel config
│
├── DEPLOYMENT.md               # Complete deployment guide
├── TESTING.md                  # Testing procedures
├── PRE_DEPLOYMENT_CHECKLIST.md # Pre-deploy verification
├── README.md                   # This file
├── QUICKSTART.md               # Quick start guide
├── package.json                # Root package.json
└── vercel.json                 # Root Vercel config
```

---

## 📚 Available Scripts

### Root Level
```bash
npm run install-all           # Install all dependencies
npm run start-servers         # Start both backend & frontend
npm run dev                   # Start with hot reload
npm run backend:dev          # Start backend with nodemon
npm run frontend             # Start frontend only
npm run build                # Build frontend for production
```

### Backend
```bash
cd backend
npm start                    # Production server
npm run dev                  # Development with hot reload
npm test                     # Run tests
```

### Frontend
```bash
cd frontend
npm run dev                  # Development server
npm run build                # Build for production
npm run preview              # Preview production build
```

---

## 🔐 Authentication & Authorization

### JWT-Based Authentication
- Users login with email/password
- Backend returns JWT token
- Token stored in localStorage
- Included in all API requests via Authorization header
- Protected routes check token validity

### Role-Based Access
- **Citizen** - File complaints, view own tickets, leave feedback
- **Officer** - View assigned complaints, update status, resolve tickets
- **Supervisor** - View all complaints, analytics, manage officers
- **Admin** - Full system access

---

## 🌐 API Documentation

All API routes require authentication except `/api/auth/login`.

### Auth Endpoints
```
POST   /api/auth/login              - Login and get JWT token
```

### Complaint Endpoints
```
GET    /api/complaints              - List all complaints
POST   /api/complaints              - Create new complaint
GET    /api/complaints/:id          - Get specific complaint
PATCH  /api/complaints/:id/status   - Update complaint status
POST   /api/complaints/:id/image    - Upload complaint image
PATCH  /api/complaints/:id/rating   - Rate complaint resolution
```

### Analytics Endpoints
```
GET    /api/analytics/overview      - System overview stats
GET    /api/analytics/accountability - Officer performance scores
GET    /api/analytics/analytics     - Detailed metrics
```

### AI Endpoints
```
POST   /api/ai/classify             - Classify complaint text
POST   /api/ai/chat                 - AI chatbot response
```

### Other Endpoints
```
GET    /api/health                  - Server health check
GET    /api/officers                - List officers
GET    /api/feedback                - Get all feedback
POST   /api/feedback                - Submit feedback
GET    /api/civic/feed              - Civic community feed
GET    /api/civic/leaderboard       - Community leaderboard
```

---

## 🚢 Deployment to Vercel

### Quick Deploy (3 steps)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy Backend**
   - Go to vercel.com/new
   - Select repository
   - Root directory: `./backend`
   - Add environment variables (see DEPLOYMENT.md)
   - Deploy

3. **Deploy Frontend**
   - Go to vercel.com/new
   - Select repository
   - Root directory: `./frontend`
   - Set `VITE_API_BASE_URL` to backend URL
   - Deploy

For detailed instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🧪 Testing

All features have been tested and verified working. See **[TESTING.md](./TESTING.md)** for:
- Complete page testing checklist
- API endpoint testing
- Mobile responsiveness verification
- Browser compatibility
- Performance benchmarks

---

## ⚙️ Configuration

### Environment Variables

**Backend** (.env)
```
PORT=8080
MONGODB_URI=mongodb://localhost:27017/sugrs
GEMINI_API_KEY=AIza...
FAST2SMS_API_KEY=... (optional)
NODE_ENV=development
```

**Frontend** (.env.local)
```
VITE_API_BASE_URL=http://localhost:8080
```

### Database Models

**User**
- name, email, password (hashed)
- role (citizen, officer, supervisor, admin)
- department, phone, etc.

**Complaint**
- title, description, category, priority
- location (lat, lng, address)
- status (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- assignedOfficer, citizen info
- timeline of updates

**Feedback**
- complaintId, rating (1-5), comment
- timestamp, citizen info

**AuditLog**
- action, userId, details
- timestamp, IP address

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem: Blank page / Loading forever**
- Check browser console (F12)
- Verify backend is running and accessible
- Check network tab for failed requests
- Verify `VITE_API_BASE_URL` is correct

**Problem: Maps not showing**
- Leaflet.js needs proper setup
- Check console for errors
- Verify map coordinates (lat/lng) are valid
- Check for CORS errors

**Problem: API calls failing**
- Check backend status
- Verify token in localStorage
- Check browser console for CORS errors
- Ensure authorization header is sent

### Backend Issues

**Problem: MongoDB connection error**
- Verify `MONGODB_URI` in .env
- Check MongoDB is running (local) or accessible (Atlas)
- Verify network access in MongoDB Atlas
- Check database user credentials

**Problem: "Cannot find module" errors**
- Run `npm install` in backend directory
- Check package.json for correct versions
- Delete node_modules and reinstall

**Problem: Port already in use**
- Change `PORT` in .env
- Or kill process: `lsof -i :8080` then `kill -9 <PID>`

**Problem: Seed data not loading**
- Check database connection first
- Verify db.js is executed
- Check for duplicate data errors
- Manually seed if needed

### General Issues

**Problem: CORS errors**
- Update backend `server.js` CORS config
- Ensure frontend URL is in allowed origins
- Check `credentials: true` if needed

**Problem: Slow performance**
- Check database indexes
- Optimize queries
- Check network latency
- Monitor server resources

---

## 📈 Performance Optimization

### Frontend
- Lazy load pages with React.lazy()
- Image optimization with CDN
- Minify CSS/JS in production
- Enable browser caching
- Use service workers

### Backend
- Add database indexes
- Implement pagination
- Cache frequently accessed data
- Connection pooling for MongoDB
- Gzip compression

---

## 🔒 Security Practices

✅ **Implemented:**
- JWT authentication
- Password hashing (bcrypt)
- CORS protection
- Input validation
- HTTPS (Vercel default)
- Environment variables for secrets
- SQL injection prevention (Mongoose)
- XSS protection

⚠️ **To Implement:**
- Rate limiting on API
- Request validation middleware
- Helmet.js for security headers
- Audit logging
- 2FA for admin accounts

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

---

## 📞 Support & Documentation

- **Frontend Guide:** See `frontend/src/pages` for all components
- **Backend Guide:** See `backend/routes` for all endpoints
- **Deployment:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Testing:** See [TESTING.md](./TESTING.md)
- **Pre-Deploy:** See [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

---

## 📄 License

MIT License - feel free to use for educational and commercial purposes.

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🚀 Ready to Deploy?

Before deploying, complete the [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) and follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

**All pages tested and verified working! ✅**

---

**Version:** 1.0.0  
**Last Updated:** March 3, 2026  
**Status:** Production Ready ✅

