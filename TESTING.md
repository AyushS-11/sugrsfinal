# 🧪 SUGRS - Testing Guide

This document covers all pages and features to ensure they work properly before and after deployment.

## Public Pages (No Login Required)

### 1. Landing Page (`/`)
**URL:** `http://localhost:5173/` or `https://sugrs-frontend.vercel.app/`

**Features to Test:**
- [ ] Page loads without errors
- [ ] Navigation menu visible
- [ ] Feature cards display correctly (6 features)
- [ ] Statistics section shows data
- [ ] Civic community hub displays posts
- [ ] Leaderboard shows top contributors
- [ ] Feedback section loads
- [ ] All links work properly

**Expected Content:**
- "File Complaint" feature card
- "Track Complaint" feature card
- "Transparency Dashboard" feature card
- "AI Assistant" feature card
- "Citizen Feedback" feature card
- "Heatmap Visualization" feature card
- Complaint statistics
- Community feedback

---

### 2. File Complaint Page (`/file`)
**URL:** `http://localhost:5173/file`

**Features to Test:**
- [ ] Map loads and is interactive
- [ ] Clicking map sets location (lat/lng)
- [ ] Form validation works
- [ ] Category dropdown has all options:
  - [ ] Waste
  - [ ] Water
  - [ ] Road
  - [ ] Streetlight
  - [ ] Sanitation
- [ ] AI Classification shows when typing
- [ ] Image upload works (drag & drop + click)
- [ ] Submit button enables when form is valid
- [ ] Success message on submit
- [ ] Redirects to track page after submit

**Test Data:**
```
Title: Broken Street Light
Description: Streetlight on Main Street is broken
Category: Streetlight
Address: Auto-filled from map click
```

---

### 3. Track Complaint Page (`/track`)
**URL:** `http://localhost:5173/track`

**Features to Test:**
- [ ] Search by complaint ID works
- [ ] Shows complaint details when found
- [ ] Status badge displays correctly
- [ ] Timeline shows all updates
- [ ] Rating section works
- [ ] Can submit feedback on resolved complaints
- [ ] Maps show complaint location

**Test with ID:** Use any complaint ID from your database

---

### 4. Transparency Dashboard (`/transparency`)
**URL:** `http://localhost:5173/transparency`

**Features to Test:**
- [ ] Page loads and displays charts
- [ ] Statistics cards show data
- [ ] Category breakdown pie chart displays
- [ ] Status breakdown pie chart displays
- [ ] Priority breakdown pie chart displays
- [ ] Department load bar chart displays
- [ ] No console errors

---

### 5. Reports Page (`/reports`)
**URL:** `http://localhost:5173/reports`

**Features to Test:**
- [ ] Page loads without errors
- [ ] Reports section displays
- [ ] Data export works (CSV, PDF)
- [ ] Filters work properly
- [ ] Date range picker functions
- [ ] Charts render correctly

---

### 6. Map Page (`/map`)
**URL:** `http://localhost:5173/map`

**Features to Test:**
- [ ] Leaflet map loads
- [ ] Complaint markers display on map
- [ ] Clicking marker shows complaint info
- [ ] Map is interactive (zoom, pan)
- [ ] Location information displays correctly
- [ ] Filter by complaint status works

---

### 7. AI Assistant Page (`/assistant`)
**URL:** `http://localhost:5173/assistant`

**Features to Test:**
- [ ] Chat interface loads
- [ ] Message input accepts text
- [ ] AI responses display correctly
- [ ] Form extraction works
- [ ] Multiple language support works:
  - [ ] English
  - [ ] Hindi
  - [ ] Marathi
  - [ ] Tamil
  - [ ] Telugu
- [ ] Voice input works (microphone)
- [ ] File complaint from chat works
- [ ] No CORS errors in console

---

### 8. Feedback Page (`/feedback`)
**URL:** `http://localhost:5173/feedback`

**Features to Test:**
- [ ] Feedback form displays
- [ ] Star rating works (1-5 stars)
- [ ] Text input accepts feedback
- [ ] Submit button works
- [ ] Success message shows
- [ ] Data submits to backend

---

## Authentication Pages

### 9. Officer Login (`/officer/login`)
**URL:** `http://localhost:5173/officer/login`

**Test Credentials:**
```
Email: rajan@sugrs.in
Password: officer123
```

**Features to Test:**
- [ ] Form renders correctly
- [ ] Email/password inputs work
- [ ] "Demo" button fills in credentials
- [ ] Login button submits form
- [ ] Error message on invalid credentials
- [ ] Redirects to `/officer/dashboard` on success
- [ ] Token stored in localStorage

---

### 10. Supervisor/Admin Login (`/supervisor/login`)
**URL:** `http://localhost:5173/supervisor/login`

**Test Credentials:**
```
Email: admin@sugrs.in
Password: admin123
```

**Features to Test:**
- [ ] Same as Officer Login
- [ ] Redirects to `/supervisor/dashboard` on success

---

## Officer-Only Pages

### 11. Officer Dashboard (`/officer/dashboard`)
**URL:** `http://localhost:5173/officer/dashboard`

**Features to Test:**
- [ ] Protected route (redirects if not logged in)
- [ ] User name displays
- [ ] Complaint queue shows assigned complaints
- [ ] KPI cards display stats
- [ ] Charts display data
- [ ] Real-time updates work

---

### 12. Complaint Queue (`/officer/queue`)
**URL:** `http://localhost:5173/officer/queue`

**Features to Test:**
- [ ] Lists all assigned complaints
- [ ] Sorting works
- [ ] Filtering by status works
- [ ] Can click to view details
- [ ] Can update status
- [ ] Real-time updates

---

### 13. Resolve Complaint (`/officer/resolve`)
**URL:** `http://localhost:5173/officer/resolve`

**Features to Test:**
- [ ] Complaint selection works
- [ ] Status update dropdown works
- [ ] Note/comment input works
- [ ] Submit button works
- [ ] Success confirmation
- [ ] Page redirects after submit

---

## Supervisor/Admin Pages

### 14. Supervisor Dashboard (`/supervisor/dashboard`)
**URL:** `http://localhost:5173/supervisor/dashboard`

**Features to Test:**
- [ ] Protected route
- [ ] Overview stats display
- [ ] Department performance shows
- [ ] Real-time alerts show
- [ ] User profile visible

---

### 15. Analytics Page (`/supervisor/analytics`)
**URL:** `http://localhost:5173/supervisor/analytics`

**Features to Test:**
- [ ] Page loads without lag
- [ ] KPI counters animate
- [ ] All charts render:
  - [ ] Category pie chart
  - [ ] Status pie chart
  - [ ] Priority pie chart
  - [ ] Department bar chart
- [ ] Data is accurate
- [ ] Responsive on mobile

---

### 16. Accountability Page (`/supervisor/accountability`)
**URL:** `http://localhost:5173/supervisor/accountability`

**Features to Test:**
- [ ] Officer scores calculate
- [ ] Leaderboard displays
- [ ] Performance metrics show
- [ ] Filters work
- [ ] Export works

---

### 17. Escalations Page (`/supervisor/escalations`)
**URL:** `http://localhost:5173/supervisor/escalations`

**Features to Test:**
- [ ] Escalated complaints display
- [ ] Details show when selected
- [ ] Actions available (reassign, resolve, etc.)
- [ ] History shows all changes

---

### 18. Merge Tickets Page (`/supervisor/merge)
**URL:** `http://localhost:5173/supervisor/merge`

**Features to Test:**
- [ ] Auto-scan detects duplicates
- [ ] Similarity score displays
- [ ] Merge button works
- [ ] Merged data correct
- [ ] Success message shows

---

### 19. All Complaints Page (`/supervisor/complaints`)
**URL:** `http://localhost:5173/supervisor/complaints`

**Features to Test:**
- [ ] All complaints display
- [ ] Search works
- [ ] Filters work (status, category, etc.)
- [ ] Sorting works
- [ ] Pagination works
- [ ] Can click to view details

---

### 20. Officers Management Page (`/supervisor/officers`)
**URL:** `http://localhost:5173/supervisor/officers`

**Features to Test:**
- [ ] Officer list displays
- [ ] Performance stats show
- [ ] Can search officers
- [ ] Can view officer details
- [ ] Can reassign complaints

---

### 21. Heatmap Page (`/supervisor/heatmap`)
**URL:** `http://localhost:5173/supervisor/heatmap`

**Features to Test:**
- [ ] Map loads
- [ ] Complaint markers display
- [ ] Markers color-coded by status
- [ ] Marker size by priority
- [ ] Popup shows complaint info
- [ ] Filters work
- [ ] Responsive

---

## API Endpoints Testing

### Backend Health Check
```bash
curl http://localhost:8080/api/health
# Expected: {"status":"ok"}
```

### Authentication
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajan@sugrs.in","password":"officer123"}'
# Expected: {"user":{...}, "token":"..."}
```

### Get Complaints
```bash
curl http://localhost:8080/api/complaints \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: [{"_id":"...","title":"..."}]
```

### Submit Complaint
```bash
curl -X POST http://localhost:8080/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Broken Road",
    "description":"Pothole on Main St",
    "category":"Road",
    "address":"Main St",
    "lat":28.5244,
    "lng":77.2068,
    "citizenName":"John",
    "citizenPhone":"9876543210"
  }'
# Expected: {"_id":"...","status":"PENDING"}
```

---

## Mobile Responsiveness Testing

Test all pages on:
- [ ] iPhone 12 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

**Check for:**
- [ ] Text readable
- [ ] Buttons clickable
- [ ] Images load
- [ ] No horizontal scrolling
- [ ] Layout adapts properly

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Check for:**
- [ ] All pages load
- [ ] No console errors
- [ ] Styling correct
- [ ] Maps work
- [ ] File uploads work

---

## Performance Testing

### Page Load Times (Goal: < 3s)
```bash
# Use Lighthouse or WebPageTest
# Check performance on:
- [ ] Landing Page
- [ ] File Complaint Page
- [ ] Dashboard
- [ ] Analytics Page
```

### Network Tab
- [ ] Check all requests have 200 status
- [ ] No failed requests
- [ ] API responses < 500ms
- [ ] No memory leaks

---

## Security Testing

### HTTPS/SSL
- [ ] All pages load over HTTPS
- [ ] Mixed content warnings absent
- [ ] SSL certificate valid

### Authentication
- [ ] Unauthenticated users can't access protected pages
- [ ] JWT tokens expire properly
- [ ] Can't modify token to access other users' data
- [ ] Password reset works

### Input Validation
- [ ] XSS attacks prevented
- [ ] SQL injection prevented
- [ ] Form validation works

---

## Pre-Deployment Checklist

### Frontend
- [ ] No console errors
- [ ] All pages load
- [ ] All API calls working
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] No hardcoded URLs (use env vars)
- [ ] Build succeeds: `npm run build`

### Backend
- [ ] All endpoints tested
- [ ] Database connections work
- [ ] Error handling implemented
- [ ] No sensitive data in logs
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Env variables configured

### Database
- [ ] MongoDB connected
- [ ] Collections created
- [ ] Seed data loaded
- [ ] Indexes created
- [ ] Backups configured

---

## Post-Deployment Verification

After deploying to Vercel:

1. **Test all public pages**
   ```bash
   https://sugrs-frontend.vercel.app/
   https://sugrs-frontend.vercel.app/file
   https://sugrs-frontend.vercel.app/track
   ```

2. **Test backend API**
   ```bash
   https://sugrs-backend.vercel.app/api/health
   https://sugrs-backend.vercel.app/api/complaints
   ```

3. **Test authentication**
   - Login with test credentials
   - Token stored in localStorage
   - Can access protected pages

4. **Monitor logs**
   - Check Vercel dashboard for errors
   - Monitor MongoDB Atlas connection
   - Check API response times

---

## Troubleshooting

### Page shows blank/loading forever
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Verify API URL is correct
- [ ] Check backend is running/deployed
- [ ] Check database connection

### API returns 404
- [ ] Verify endpoint path is correct
- [ ] Check backend routes are defined
- [ ] Check method (GET, POST, etc.)
- [ ] Verify authentication token if required

### Images/Maps not loading
- [ ] Check CDN/image URLs
- [ ] Verify CORS headers
- [ ] Check file permissions
- [ ] Verify S3/storage bucket if used

### Slow performance
- [ ] Check database query performance
- [ ] Enable caching
- [ ] Optimize images
- [ ] Check for N+1 queries
- [ ] Monitor API response times

---

**Happy testing! 🚀**

