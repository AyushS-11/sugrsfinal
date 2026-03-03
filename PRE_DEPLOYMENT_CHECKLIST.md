# 📋 Pre-Deployment Checklist

Complete this checklist before deploying SUGRS to Vercel.

## Code Quality

### Frontend
- [ ] No console errors: `npm run build` completes successfully
- [ ] All imports resolve correctly
- [ ] No unused variables or dependencies
- [ ] Environment variables configured:
  - [ ] `VITE_API_BASE_URL` set to backend URL
  - [ ] No hardcoded API URLs
- [ ] All pages render without errors
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] All links work and routes resolve

### Backend
- [ ] No runtime errors on startup
- [ ] All environment variables loaded:
  - [ ] `MONGODB_URI`
  - [ ] `GEMINI_API_KEY`
  - [ ] `FAST2SMS_API_KEY` (optional)
  - [ ] `PORT`
  - [ ] `NODE_ENV`
- [ ] Database migrations completed
- [ ] CORS configured for all frontend domains
- [ ] Error handling implemented on all endpoints
- [ ] No console.error or warning messages

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (IP whitelist)
- [ ] Connection string verified and working
- [ ] Seed data loaded (test users/data)
- [ ] Indexes created for performance
- [ ] Backups enabled

## Functionality Testing

### Public Pages (No Auth)
- [ ] Landing Page (/) - loads and displays all sections
- [ ] File Complaint (/file) - form works, map interactive
- [ ] Track Complaint (/track) - search works
- [ ] Transparency (/transparency) - charts render
- [ ] Reports (/reports) - data displays
- [ ] Map (/map) - leaflet loads with markers
- [ ] AI Assistant (/assistant) - chat works with Gemini API
- [ ] Feedback (/feedback) - form submits

### Authentication
- [ ] Officer Login (/officer/login) - token generated and stored
- [ ] Supervisor Login (/supervisor/login) - redirects correctly
- [ ] Logout works - token removed from storage
- [ ] Protected routes block unauthenticated access
- [ ] Session persists on page refresh

### Officer Pages
- [ ] Officer Dashboard (/officer/dashboard) - stats display
- [ ] Complaint Queue (/officer/queue) - loads complaints
- [ ] Resolve Complaint (/officer/resolve) - status updates work

### Supervisor Pages
- [ ] Supervisor Dashboard (/supervisor/dashboard) - displays data
- [ ] Analytics (/supervisor/analytics) - charts render
- [ ] All Complaints (/supervisor/complaints) - lists load
- [ ] Officers (/supervisor/officers) - officer list displays
- [ ] Heatmap (/supervisor/heatmap) - map with markers loads
- [ ] Accountability (/supervisor/accountability) - scores calculate
- [ ] Escalations (/supervisor/escalations) - displays escalated
- [ ] Merge Tickets (/supervisor/merge) - duplicate detection works

## API Testing

### Authentication Endpoints
```bash
✓ POST /api/auth/login - returns token
✓ GET /api/auth/profile - requires token
✓ POST /api/auth/logout - clears token
```

### Complaint Endpoints
```bash
✓ GET /api/complaints - returns list
✓ POST /api/complaints - creates complaint
✓ GET /api/complaints/:id - returns specific complaint
✓ PATCH /api/complaints/:id/status - updates status
✓ POST /api/complaints/:id/image - uploads image
```

### Analytics Endpoints
```bash
✓ GET /api/analytics/overview - returns stats
✓ GET /api/analytics/accountability - returns scores
✓ GET /api/analytics/analytics - returns detailed metrics
```

### AI Endpoints
```bash
✓ POST /api/ai/classify - classifies complaint text
✓ POST /api/ai/chat - returns AI chat response
```

### Other Endpoints
```bash
✓ GET /api/health - returns {"status":"ok"}
✓ GET /api/feedback - returns feedback list
✓ POST /api/feedback - submits feedback
```

## Performance

### Frontend
- [ ] First Contentful Paint < 2s (desktop)
- [ ] Largest Contentful Paint < 3s (desktop)
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 4s (desktop)
- [ ] All images optimized and lazy-loaded
- [ ] No unused CSS/JavaScript

### Backend
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] No memory leaks detected
- [ ] No N+1 database queries
- [ ] Connection pooling configured

## Security

### Frontend
- [ ] HTTPS enforced (Vercel default)
- [ ] No sensitive data in localStorage (except token)
- [ ] CSP headers configured
- [ ] XSS protection implemented
- [ ] Form validation on all inputs
- [ ] CSRF tokens if needed

### Backend
- [ ] All inputs validated and sanitized
- [ ] SQL injection prevention (Mongoose prevents this)
- [ ] Rate limiting implemented
- [ ] CORS headers correct
- [ ] Authentication on all protected routes
- [ ] Password hashing implemented
- [ ] API key rotation planned
- [ ] Error messages don't leak sensitive info

### Database
- [ ] No passwords in connection string visible
- [ ] IP whitelist configured
- [ ] Database user has minimal required permissions
- [ ] Backups encrypted
- [ ] Access logs enabled

## Deployment Configuration

### Environment Variables Setup
```bash
# Backend (.env on Vercel)
✓ PORT=3001
✓ MONGODB_URI=mongodb+srv://...
✓ GEMINI_API_KEY=AIza...
✓ FAST2SMS_API_KEY=... (optional)
✓ NODE_ENV=production

# Frontend (.env.local on Vercel)
✓ VITE_API_BASE_URL=https://backend-url
```

### Vercel Setup
- [ ] GitHub repo connected to Vercel
- [ ] Backend project created (root: ./backend)
- [ ] Frontend project created (root: ./frontend)
- [ ] Environment variables added to both projects
- [ ] Build commands configured:
  - [ ] Backend: `npm install && npm start`
  - [ ] Frontend: `npm install && npm run build`
- [ ] Deployment preview working
- [ ] Production deployments protected

### GitHub Configuration
- [ ] `.gitignore` prevents .env files from being committed
- [ ] No secrets in git history
- [ ] Branch protection enabled (main branch)
- [ ] Pull request reviews required

## Documentation

- [ ] README.md updated with deployment info
- [ ] DEPLOYMENT.md complete with step-by-step guide
- [ ] TESTING.md covers all page and feature tests
- [ ] API documentation available
- [ ] Environment variables documented
- [ ] Known issues and workarounds listed

## Monitoring Setup

- [ ] Vercel Analytics enabled
- [ ] MongoDB Atlas monitoring configured
- [ ] Error tracking service configured (optional)
- [ ] Email alerts setup for deployment failures
- [ ] Logging configured in backend
- [ ] Performance monitoring enabled

## Backup & Recovery

- [ ] MongoDB Atlas backups enabled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Important contact information saved
- [ ] Access credentials securely stored

## Final Checks

- [ ] Product owner approval obtained
- [ ] Security review completed
- [ ] Load testing passed (simulated peak traffic)
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness tested
- [ ] All team members briefed on deployment
- [ ] Rollback plan in place
- [ ] Post-deployment support plan ready

## Post-Deployment

After deploying, verify:

- [ ] Frontend loads at production URL
- [ ] Backend API responds at production URL
- [ ] All pages accessible and functional
- [ ] Login/authentication works
- [ ] Database operations work
- [ ] Email/SMS notifications work (if applicable)
- [ ] File uploads work
- [ ] Maps and third-party integrations work
- [ ] Performance acceptable
- [ ] No errors in production logs
- [ ] Monitoring alerts active

## Troubleshooting

If issues arise during deployment:

1. **Check Vercel Dashboard**
   - Go to Deployments tab
   - Check build logs for errors
   - View function logs for runtime errors

2. **Check Database**
   - Verify MongoDB Atlas connection
   - Check IP whitelist includes Vercel
   - Test connection from backend

3. **Check Environment Variables**
   - Verify all required vars are set
   - Ensure no typos in variable names
   - Check values are correct (especially URLs)

4. **Rollback**
   - Go to Deployments tab
   - Find last working deployment
   - Click "Promote to Production"

## Sign-Off

- [ ] Frontend Developer Sign-Off: __________
- [ ] Backend Developer Sign-Off: __________
- [ ] QA/Tester Sign-Off: __________
- [ ] DevOps/Deployment Lead Sign-Off: __________
- [ ] Product Owner Sign-Off: __________

**Deployment Date:** __________

**Deployment Time:** __________

**Deployed Version:** __________

---

**Ready to Deploy! 🚀**

