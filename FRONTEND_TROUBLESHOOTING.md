# 🆘 FRONTEND INITIALIZATION TROUBLESHOOTING
## Touch of Hope CBO — CSS & API Connection Errors

**Last Updated**: March 20, 2026  
**Status**: Common Issues & Solutions

---

## 🔴 ERROR: CSS Files Not Loading (404 & Connection Refused)

### Error Messages You See
```
Failed to load resource: the server responded with a status of 404 (Not Found)
GET http://localhost:8000/base.css net::ERR_CONNECTION_REFUSED
GET http://localhost:8000/public.css net::ERR_CONNECTION_REFUSED
```

### Root Cause
The frontend `server.js` was a copy of the backend and wasn't configured to serve static files properly.

---

## ✅ SOLUTION 1: Update Frontend Server (DONE!)

### What I Fixed
1. ✅ Removed database connection code from frontend
2. ✅ Added proper static file serving with MIME types
3. ✅ Added specific routes for HTML files
4. ✅ Fixed PORT from 5000 to 8000 in `.env`

### Verification
Your frontend `server.js` should now have:
- MIME type definitions for CSS, JS, images
- `express.static(__dirname)` for serving files
- Specific routes for index.html, login.html, portal.html
- Port 8000 listening

**Files Updated**:
- ✅ `frontend/server.js` - Fixed
- ✅ `frontend/.env` - PORT=8000 confirmed

---

## 🔧 VERIFICATION STEPS

### Step 1: Check Frontend Server Started
Open browser and go to:
```
http://localhost:8000
```

**Expected**: See the "Touch of Hope" homepage with hero section

**If not working**: Check terminal output for:
```
╔════════════════════════════════════════════════╗
║  🌟 Touch of Hope - Frontend Server 🌟        ║
╚════════════════════════════════════════════════╝

✅ Frontend server running on http://localhost:8000
```

### Step 2: Test CSS Files Load
Open browser DevTools: `F12`
Go to Network tab
Reload page: `F5`

**Look for**:
- `base.css` - Status: 200 (green) ✅
- `public.css` - Status: 200 (green) ✅
- `logo.png` - Status: 200 (green) ✅

**If showing 404**: CSS files aren't in the frontend folder - check file exists:
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
ls *.css
```

Expected output:
```
auth.css
base.css
pages.css
portal.css
public.css
```

### Step 3: Test API Connection
In browser console (F12 → Console tab), run:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend responding:', d))
  .catch(e => console.error('❌ Backend offline:', e.message))
```

**Expected output**:
```
✅ Backend responding: {status: 'ok', time: '...', env: 'development'}
```

**If error**: Backend not running - see "Backend Setup" section below

### Step 4: Test Frontend API Wrapper
In browser console, run:
```javascript
// Test the api() function from api.js
api('GET', '/auth/me', null, false)
  .then(d => console.log('✅ API working:', d))
  .catch(e => console.error('❌ API error:', e.message))
```

**Expected output** (if not logged in):
```
❌ API error: Request failed
```
This is OK - you're not authenticated yet.

---

## 🚀 NEXT STEPS: COMPLETE SETUP

### Terminal 1: Backend
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm install
npm run seed
npm run dev
```

**Wait for**:
```
✅ Database connected to MongoDB
✅ Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
npm install
npm run dev
```

**Wait for**:
```
✅ Frontend server running on http://localhost:8000
```

### Terminal 3: Browser
Open browser:
```
http://localhost:8000
```

**Expected**: 
- ✅ Page loads with logo
- ✅ CSS styling visible
- ✅ Hero section visible
- ✅ Buttons clickable

---

## 🧪 TEST LOGIN FLOW

### Step 1: Go to Login Page
```
http://localhost:8000/login.html
```

### Step 2: Enter Credentials
After backend seed ran, use:
- **Email**: `member@test.com`
- **Password**: `Test@1234`

### Step 3: Click Login
**Expected**: 
- ✅ Portal page loads
- ✅ Dashboard visible
- ✅ User name displays
- ✅ Sidebar navigation shows

**If login fails**:
1. Check backend is running
2. Check API_URL in `config.js` = `http://localhost:5000/api`
3. Check database seed completed

---

## ❌ COMMON ISSUES & FIXES

### Issue 1: "Failed to load resource: 404"
```
GET http://localhost:8000/base.css 404 (Not Found)
GET http://localhost:8000/public.css 404 (Not Found)
```

**Cause**: CSS files missing or frontend server not serving them

**Fix**:
```bash
# Verify CSS files exist
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
ls *.css

# If missing, check they're in backend and copy
cp ../backend/*.css .

# Restart frontend
npm run dev
```

### Issue 2: "ERR_CONNECTION_REFUSED on localhost:8000"
```
GET http://localhost:8000/ net::ERR_CONNECTION_REFUSED
```

**Cause**: Frontend server not running

**Fix**:
```bash
# Make sure you're in frontend folder
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"

# Kill any existing process on port 8000
lsof -i :8000

# Start frontend
npm run dev

# Should show: ✅ Frontend server running on http://localhost:8000
```

### Issue 3: "Cannot GET /" after server starts
```
Cannot GET /
```

**Cause**: Frontend server running but not serving index.html

**Fix**:
```bash
# Check index.html exists
ls index.html

# Verify server.js has route for /
cat server.js | grep "app.get('/', "

# Restart
npm run dev
```

### Issue 4: API Calls Return 404
```
POST http://localhost:5000/api/auth/login 404 (Not Found)
```

**Cause**: Backend not running or API endpoint missing

**Fix**:
```bash
# In backend terminal
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm run dev

# Wait for: ✅ Server running on http://localhost:5000

# Test in browser console
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Issue 5: CORS Error (Access Blocked)
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' 
from origin 'http://localhost:8000' has been blocked by CORS policy
```

**Cause**: Backend CORS not configured for frontend URL

**Fix**:
```bash
# Update backend/.env
FRONTEND_URL=http://localhost:8000

# Restart backend
cd backend
npm run dev
```

---

## 📋 FINAL VERIFICATION CHECKLIST

After making these fixes, verify:

- [ ] Frontend serves on http://localhost:8000
- [ ] Page loads without 404 errors
- [ ] CSS files load (base.css, public.css, etc.)
- [ ] Images load (logo.png, favicon.ico)
- [ ] Backend running on http://localhost:5000
- [ ] API endpoint http://localhost:5000/api/health responds
- [ ] Login page accessible at http://localhost:8000/login.html
- [ ] Can login with member@test.com / Test@1234
- [ ] Portal page loads after login
- [ ] Dashboard displays user info
- [ ] No console errors in browser (F12)
- [ ] No errors in backend terminal

---

## 🎯 QUICK COMMAND REFERENCE

### Start Everything (3 Terminals)

**Terminal 1 - MongoDB** (only if local):
```bash
mongod
```

**Terminal 2 - Backend**:
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm run dev
```

**Terminal 3 - Frontend**:
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
npm run dev
```

**Terminal 4 - Browser**:
```
http://localhost:8000
```

### Useful URLs

| URL | Purpose |
|-----|---------|
| http://localhost:8000 | Frontend home |
| http://localhost:8000/login.html | Login page |
| http://localhost:8000/portal.html | Member portal |
| http://localhost:5000/api/health | Backend health |
| http://localhost:5000/api/auth/me | Current user (needs JWT) |

---

## 📞 IF STILL NOT WORKING

1. **Check Backend Logs**:
   - Backend terminal should show `✅ Server running on http://localhost:5000`
   - If error, see backend troubleshooting guide

2. **Check Frontend Logs**:
   - Frontend terminal should show `✅ Frontend server running on http://localhost:8000`
   - If error, check node_modules exists: `ls node_modules`

3. **Check Browser Console**:
   - Open DevTools: `F12`
   - Look for red error messages
   - Check Network tab for failed requests

4. **Check File Structure**:
   ```bash
   cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3"
   ls -la frontend/
   ls -la backend/
   ```
   Should both show `node_modules/` folder

---

## ✅ SUCCESS INDICATORS

When everything works correctly, you'll see:

**Frontend Terminal**:
```
✅ Frontend server running on http://localhost:8000
📝 Available Pages:
   🏠 Home:    http://localhost:8000/
   🔐 Login:   http://localhost:8000/login.html
   📊 Portal:  http://localhost:8000/portal.html
```

**Browser**:
- ✅ Page loads with styling
- ✅ Logo displays
- ✅ Buttons have proper styling
- ✅ No red errors in console (F12)

**Network Tab** (F12 → Network):
- ✅ HTML files: 200
- ✅ CSS files: 200
- ✅ JS files: 200
- ✅ Images: 200
- ✅ API calls: 200/201

---

**Document Version**: 1.0 - Troubleshooting Guide  
**Last Updated**: March 20, 2026  
**Status**: ✅ READY TO USE

