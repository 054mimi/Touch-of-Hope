# 🎯 COMPLETE SYSTEM STARTUP GUIDE
## Touch of Hope CBO — From Zero to Running

**Status**: Ready to Launch  
**Date**: March 20, 2026  
**Estimated Time**: 10-15 minutes total

---

## 📋 PRE-STARTUP CHECKLIST

Before starting, verify you have:

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] MongoDB running (local or Atlas connected)
- [ ] Backend folder with `node_modules/` already installed
- [ ] Frontend folder with `node_modules/` already installed
- [ ] Both `.env` files created and configured
- [ ] Terminal ready with 3-4 tabs/windows available
- [ ] Browser ready (Chrome/Firefox/Safari)

---

## 🚀 STARTUP SEQUENCE

### ✅ STEP 1: Start Backend Server (Terminal 1)

**Location**: Backend folder

```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm run dev
```

**Expected Output** (wait 3-5 seconds):
```
[nodemon] starting `node server.js`

╔════════════════════════════════════════════╗
║  🚀 Touch of Hope API Server 🚀          ║
╚════════════════════════════════════════════╝

✅ Database connected to MongoDB
✅ Server running on http://localhost:5000

📝 Available Endpoints:
   /api/auth        - Authentication
   /api/members     - Member management
   /api/campaigns   - Campaigns
   /api/payments    - Payment processing
   /api/admin       - Admin functions
   /api/public      - Public data

🔄 Watching for changes with nodemon...
```

**If Error**: 
- ❌ "ECONNREFUSED" → MongoDB not running (start mongod or check Atlas)
- ❌ "Port 5000 already in use" → Kill process: `lsof -i :5000`
- ❌ "Cannot find module" → Run `npm install` again

**Leave this terminal running!** ✅

---

### ✅ STEP 2: Check Frontend Server (Terminal 2)

The frontend should already be running from our earlier startup.

**Verify it's running**:
```bash
# Check if something is listening on port 8001
netstat -ano | findstr :8001
```

**Expected Output**:
```
TCP    0.0.0.0:8001           0.0.0.0:0              LISTENING       [PID]
```

**If not running, start it**:
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
npm run dev
```

**Expected Output**:
```
╔════════════════════════════════════════════╗
║  🌟 Touch of Hope - Frontend Server 🌟    ║
╚════════════════════════════════════════════╝

✅ Frontend server running on http://localhost:8001

📝 Available Pages:
   🏠 Home:    http://localhost:8001/
   🔐 Login:   http://localhost:8001/login.html
   📊 Portal:  http://localhost:8001/portal.html

⚠️  IMPORTANT: Make sure backend is running!
   Backend should be running on http://localhost:5000

🔄 Watching for changes with nodemon...
```

**If Error**:
- ❌ "Port 8001 already in use" → Kill: `taskkill /IM node.exe` (Windows)
- ❌ "Cannot find module 'express'" → Run `npm install`

**Leave this terminal running!** ✅

---

### ✅ STEP 3: Seed Database (Terminal 3 - Optional but Recommended)

Populate with test data for login:

```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm run seed
```

**Expected Output** (wait 5-10 seconds):
```
✅ Database connected to MongoDB
🌱 Seeding database with sample data...
   ✓ Created users (4 test accounts)
   ✓ Created campaigns (5 samples)
   ✓ Created events (3 samples)
   ✓ Created projects (4 samples)
   ✓ Created announcements (5 samples)
✅ Sample data created successfully
```

**Test Credentials Created**:
```
Member:     member@test.com / Test@1234
Secretary:  secretary@test.com / Test@1234
Treasurer:  treasurer@test.com / Test@1234
Chairman:   chairman@test.com / Test@1234
```

**If Error**:
- ❌ "Duplicate key error" → Database already seeded (OK, proceed)
- ❌ "Connection refused" → Backend not running (start Terminal 1)

**Terminal 3 can close after seeding completes.**

---

## 🌐 TESTING IN BROWSER

### Step 1: Open Frontend

Open your browser and go to:
```
http://localhost:8001
```

**Expected to see**:
- ✅ White page with logo at top
- ✅ "Touch of Hope" hero section
- ✅ "Donate Now" button
- ✅ Statistics cards
- ✅ Campaign cards with progress bars
- ✅ No red errors in console

**If not working**:
1. Check both servers running (Terminals 1 & 2)
2. Hard refresh: `Ctrl+Shift+F5`
3. Clear cache: `F12` → Clear storage
4. Check console errors: `F12` → Console tab

---

### Step 2: Test Public Pages

Try these public pages (no login needed):

**Homepage**:
```
http://localhost:8001
```
✅ Shows hero, campaigns, events, projects

**Navigation Links**:
- Click "About" → Scrolls to about section
- Click "Campaigns" → Scrolls to campaigns
- Click "Events" → Scrolls to events

**Try Donate Button**:
- Click "Donate Now" → Should show login page (redirect)

---

### Step 3: Test Authentication

#### Go to Login Page
```
http://localhost:8001/login.html
```

**Expected to see**:
- ✅ Login form (email + password)
- ✅ Register tab
- ✅ Forgot password link
- ✅ Proper styling with CSS

#### Test Registration
1. Click "Register" tab
2. Fill form:
   - **Name**: Test User
   - **Email**: testuser@example.com
   - **Phone**: +254712345678
   - **National ID**: 12345678
   - **Password**: Test@1234 (min 8 chars, 1 uppercase, 1 number)
3. Click "Register"

**Expected**:
- ✅ Success message
- ✅ Redirect to login or verification page

#### Test Login with Seeded User
1. Go to login page
2. Enter credentials:
   - **Email**: `member@test.com`
   - **Password**: `Test@1234`
3. Click "Login"

**Expected**:
- ✅ Portal page loads
- ✅ Dashboard visible with greeting
- ✅ User name displays
- ✅ Sidebar navigation shows

---

### Step 4: Test Member Portal

After successful login:

#### Dashboard Tab
- ✅ Displays greeting: "Welcome, [Name]!"
- ✅ Shows statistics cards
- ✅ Lists recent campaigns
- ✅ Shows announcements

#### Profile Tab
- ✅ Displays user info
- ✅ Can edit name/phone
- ✅ Can change password
- ✅ Shows donation history

#### Donate Tab
- ✅ Select campaign
- ✅ Enter amount
- ✅ Select payment method
- ✅ Enter donor info
- ✅ Submit button works

#### Volunteer Portal Tab (if volunteer role)
- ✅ Shows available events
- ✅ Can apply to events
- ✅ Shows "My Events"

#### Admin Tabs (if chairman role - use chairman@test.com)
- ✅ Users: List, approve, change roles
- ✅ Campaigns: Create, edit, delete
- ✅ Events: Manage
- ✅ Reports: View financial reports
- ✅ Volunteers: Approve applications

---

## 🔍 DETAILED VERIFICATION TESTS

### Test 1: CSS Loading
**Open DevTools**: `F12`
**Go to Network tab**
**Reload page**: `F5`

**Check**:
- ✅ `base.css` - Status 200
- ✅ `public.css` - Status 200
- ✅ `portal.css` - Status 200
- ✅ `auth.css` - Status 200

**If showing 404**: CSS not served properly - restart frontend server

### Test 2: JavaScript Loading
**In DevTools Network tab**:
- ✅ `api.js` - Status 200
- ✅ `auth.js` - Status 200
- ✅ `portal.js` - Status 200
- ✅ `config.js` - Status 200

**If showing 404**: JS files not served - restart frontend

### Test 3: Images Loading
**In DevTools Network tab**:
- ✅ `logo.png` - Status 200
- ✅ `favicon.ico` - Status 200

**If showing 404**: Images missing - check files exist

### Test 4: API Connectivity

**In DevTools Console tab**, run:
```javascript
// Test backend is responding
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK:', d))
  .catch(e => console.error('❌ Backend Error:', e.message))
```

**Expected**:
```
✅ Backend OK: {status: 'ok', time: '...', env: 'development'}
```

### Test 5: Login API Call

After entering login credentials, check Network tab:

**Look for POST request**:
- URL: `http://localhost:5000/api/auth/login`
- Status: 200 (green)
- Response shows: token, user object

**If showing 401**: Wrong credentials or user not in database

---

## 🎯 TESTING CHECKLIST

After completing all steps, verify:

### Frontend Setup
- [ ] Frontend server running on 8001
- [ ] Can access http://localhost:8001
- [ ] Page loads with CSS styling
- [ ] Logo displays
- [ ] No 404 errors for resources
- [ ] All images visible

### Backend Setup  
- [ ] Backend server running on 5000
- [ ] Database connected to MongoDB
- [ ] Sample data seeded (test users created)
- [ ] API endpoints responding

### Authentication
- [ ] Can navigate to login page
- [ ] Can see registration form
- [ ] Can see forgot password link
- [ ] Can login with member@test.com
- [ ] JWT token saved in localStorage

### Portal
- [ ] Dashboard displays after login
- [ ] User name shows in sidebar
- [ ] Profile tab accessible
- [ ] Donation page loads
- [ ] Can view campaigns
- [ ] Can view announcements

### Admin (if logged in as chairman)
- [ ] Users management accessible
- [ ] Can view all users
- [ ] Can approve users
- [ ] Can change roles
- [ ] Financial reports show
- [ ] Volunteers tab shows

### API Integration
- [ ] Backend /health endpoint responds
- [ ] Login API call successful
- [ ] User data fetched from API
- [ ] Campaign data loads
- [ ] No CORS errors

### Browser Console
- [ ] No red error messages
- [ ] No failed API calls
- [ ] No missing resource errors (404)
- [ ] No CSS/JS syntax errors

---

## 📊 SUMMARY TABLE

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| Frontend | Running | 8001 | http://localhost:8001 |
| Backend | Running | 5000 | http://localhost:5000 |
| MongoDB | Running | 27017 | Local or Atlas |
| API Health | ✅ | 5000 | http://localhost:5000/api/health |
| Frontend Health | ✅ | 8001 | http://localhost:8001/api/health |

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| CSS 404 errors | Restart frontend: `npm run dev` |
| Can't reach http://localhost:8001 | Check frontend running, use port 8001 |
| Can't login | Verify backend running, check credentials (member@test.com / Test@1234) |
| Database connection error | Start mongod or check MongoDB Atlas |
| Port already in use | Kill process or change port in .env |
| API calls failing | Check backend running on 5000, check FRONTEND_URL in backend/.env |
| Page loads blank | Check browser console (F12) for errors |

---

## 🎓 UNDERSTANDING THE STACK

### Architecture
```
┌─────────────────────────┐
│   Browser (8001)        │
│  - HTML, CSS, JS        │
│  - User Interface       │
└────────────┬────────────┘
             │ HTTP Requests
             ↓
┌─────────────────────────┐
│   Frontend Server       │
│   (Express.js on 8001)  │
│  - Serves static files  │
│  - Routes HTML pages    │
└────────────┬────────────┘
             │ API calls
             ↓
┌─────────────────────────┐
│   Backend Server        │
│   (Express.js on 5000)  │
│  - REST API endpoints   │
│  - Business logic       │
│  - Authentication       │
└────────────┬────────────┘
             │ Database
             ↓
┌─────────────────────────┐
│   MongoDB Database      │
│  - Collections          │
│  - User data            │
│  - Campaign data        │
└─────────────────────────┘
```

### Data Flow Example: User Login
```
1. User types email/password in browser
2. Browser sends POST to http://localhost:5000/api/auth/login
3. Backend validates credentials
4. Backend hashes password and compares
5. Backend generates JWT token
6. Backend returns token + user object
7. Frontend JavaScript stores token in localStorage
8. Frontend redirects to portal page
9. Portal page loads from frontend server
10. Portal page requests user data with JWT token
11. Backend verifies token and returns data
12. Portal displays dashboard with user info
```

---

## 🎉 YOU'RE READY!

If everything above works:

✅ System is properly initialized
✅ Frontend and backend communicating
✅ Database populated with test data
✅ Authentication working
✅ Ready for full testing

**Next Steps**:
1. Follow COMPREHENSIVE_TESTING_GUIDE.md for complete testing
2. Test all 52 API endpoints with Postman
3. Test all features in UI
4. Prepare for production deployment

---

## 📞 HELP & SUPPORT

**For issues**:
1. Check `INITIALIZATION_GUIDE.md` for full setup steps
2. Check `FRONTEND_TROUBLESHOOTING.md` for frontend-specific issues  
3. Check `COMPREHENSIVE_TESTING_GUIDE.md` for testing procedures
4. Check browser console (F12) for error messages
5. Check terminal output for server errors

---

**Document Version**: 1.0 - Complete Startup Guide  
**Last Updated**: March 20, 2026  
**Status**: ✅ READY TO USE

