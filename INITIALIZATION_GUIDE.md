# 🚀 INITIALIZATION GUIDE
## Touch of Hope CBO — Complete Setup Instructions

**Last Updated**: March 20, 2026  
**Project Version**: 1.3  
**Status**: Ready for initialization

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Verification Steps](#verification-steps)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)

---

## ✅ PREREQUISITES

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v5.0 or higher (local or cloud)
- **Git**: For version control (optional)
- **Postman**: For API testing (recommended)

### Check Your Setup
Open a terminal and run:

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or higher

# Check npm version
npm --version
# Expected output: v9.x.x or higher

# Check MongoDB (if local)
mongod --version
# Expected output: db version version 5.x.x or higher
```

### Install Node.js (if needed)
- Visit: https://nodejs.org/
- Download: LTS (Long-Term Support) version
- Install and follow wizard
- Restart your terminal

### Install MongoDB (if needed)

**Option 1: MongoDB Community (Local)**
- Visit: https://www.mongodb.com/try/download/community
- Download for your OS
- Install and follow wizard
- Start MongoDB service

**Option 2: MongoDB Atlas (Cloud - Recommended)**
- Visit: https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Use in `.env` file

---

## 🔧 BACKEND SETUP

### Step 1: Navigate to Backend Directory

```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
```

**Expected output**: Terminal shows `backend` in current path

### Step 2: Install Dependencies

```bash
npm install
```

**What this does**:
- Downloads all packages from `package.json`
- Creates `node_modules/` folder
- Creates `package-lock.json` (lock file)

**Expected output**:
```
added 250 packages, and audited 251 packages
found 0 vulnerabilities
```

**Time**: 2-5 minutes (depends on internet speed)

### Step 3: Verify Installation

```bash
npm list
```

**Expected output**: Shows dependency tree with versions

**Key packages to verify**:
- express (4.18.2)
- mongoose (8.2.0)
- jsonwebtoken (9.0.2)
- stripe (14.18.0)
- nodemailer (8.0.3)

### Step 4: Check Installed Files

```bash
# List node_modules to verify installation
ls -la node_modules | head -20
```

**Expected**: Long list of package folders

---

## 🎨 FRONTEND SETUP

### Step 1: Navigate to Frontend Directory

```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
```

**Expected output**: Terminal shows `frontend` in current path

### Step 2: Check What's in Frontend

```bash
ls -la
```

**Expected files**:
- ✅ `index.html` (public page)
- ✅ `login.html` (auth page)
- ✅ `portal.html` (member portal)
- ✅ `server.js` (frontend server)
- ✅ `package.json` (dependencies)
- ✅ JavaScript files (api.js, auth.js, page.*.js)
- ✅ CSS files (base.css, pages.css, auth.css)
- ✅ Images (logo.png, favicon.ico)

### Step 3: Install Frontend Dependencies

```bash
npm install
```

**What gets installed**:
- express (simple HTTP server)
- dotenv (environment variables)
- nodemon (auto-restart on changes)

**Expected output**:
```
added 50 packages, and audited 51 packages
found 0 vulnerabilities
```

### Step 4: Verify Installation

```bash
npm list
```

Should show express, dotenv, nodemon

---

## 🗄️ DATABASE SETUP

### Option 1: MongoDB Atlas (Cloud - Recommended)

#### 1a. Create Free Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with email
4. Verify email

#### 1b. Create Cluster
1. Click "Create a Deployment"
2. Choose "Free Shared" (0 cost)
3. Select region (closest to you)
4. Create cluster (takes 2-3 minutes)

#### 1c. Get Connection String
1. Click "Connect" button
2. Choose "Drivers"
3. Select Node.js version 4.x or higher
4. Copy connection string
5. **Replace `<password>` with your database password**

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/touchofhope?retryWrites=true&w=majority
```

#### 1d. Add IP to Whitelist
1. Click "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (development only!)
4. Confirm

#### 1e. Get Database Credentials
1. Click "Database Access"
2. Click "Add New Database User"
3. Create username: `touchofhope`
4. Create password: (save this!)
5. Click "Create"

### Option 2: MongoDB Local

#### 2a. Start MongoDB Service
```bash
# Windows
mongod

# Or if installed as service, it starts automatically
```

#### 2b. Get Connection String
```
mongodb://localhost:27017/touchofhope
```

#### 2c. Verify Connection
```bash
# In another terminal, test connection
mongosh mongodb://localhost:27017
```

**Expected output**:
```
test> 
```

Type `exit` to quit.

---

## 🔐 ENVIRONMENT CONFIGURATION

### Step 1: Create Backend .env File

Navigate to backend folder:
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
```

Create `.env` file:
```bash
# Windows - using echo (note: use this exact format)
echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/touchofhope > .env
```

**Or manually**:
1. Open VS Code
2. Right-click `backend` folder
3. Click "New File"
4. Name it `.env`
5. Copy content below

### Step 2: Fill Backend Environment Variables

**Required variables** (.env file):

```env
# ═══════════════════════════════════════════════════════════════
# TOUCH OF HOPE - BACKEND ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════

# DATABASE ────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://touchofhope:YOUR_PASSWORD@cluster.mongodb.net/touchofhope?retryWrites=true&w=majority
# OR for local: MONGODB_URI=mongodb://localhost:27017/touchofhope

# AUTHENTICATION ──────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# FRONTEND ────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:8000

# EMAIL SERVICE (Nodemailer + Gmail) ──────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_not_gmail_password
# How to get app password:
# 1. Enable 2FA on Google Account: https://myaccount.google.com/security
# 2. Go to App Passwords: https://myaccount.google.com/apppasswords
# 3. Select "Mail" and "Windows Computer"
# 4. Google generates 16-char password
# 5. Use that password here (without spaces)

SENDER_EMAIL=your_email@gmail.com
SENDER_NAME=Touch of Hope

# STRIPE (Optional but recommended) ────────────────────────────
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
# Get from: https://dashboard.stripe.com/apikeys

# M-PESA (Optional) ────────────────────────────────────────────
MPESA_CONSUMER_KEY=YOUR_M_PESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET=YOUR_M_PESA_CONSUMER_SECRET
MPESA_SHORTCODE=YOUR_BUSINESS_SHORTCODE
MPESA_PASSKEY=YOUR_M_PESA_PASSKEY
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback

# PAYPAL (Optional) ────────────────────────────────────────────
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
PAYPAL_MODE=sandbox

# SERVER ──────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
# For production, change to: NODE_ENV=production

# BACKUP (Optional) ────────────────────────────────────────────
BACKUP_LOCATION=./backups
BACKUP_SCHEDULE=0 2 * * * # Daily at 2 AM
```

### Step 3: Create Frontend .env File

Navigate to frontend folder:
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
```

Create `.env` file with:

```env
# ═══════════════════════════════════════════════════════════════
# TOUCH OF HOPE - FRONTEND ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════

# API ENDPOINT ─────────────────────────────────────────────────
REACT_APP_API_URL=http://localhost:5000/api

# STRIPE PUBLIC KEY ────────────────────────────────────────────
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY

# PAYPAL CLIENT ID ─────────────────────────────────────────────
REACT_APP_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID

# ENVIRONMENT ──────────────────────────────────────────────────
REACT_APP_ENV=development
```

### Step 4: Verify Environment Files

Check they exist:
```bash
# Backend
ls "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend\.env"

# Frontend
ls "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend\.env"
```

**Expected**: Files listed without errors

---

## ✔️ VERIFICATION STEPS

### Backend Verification

#### 1. Check Dependencies
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm list | grep -E "express|mongoose|jsonwebtoken"
```

**Expected output**:
```
├── express@4.18.2
├── mongoose@8.2.0
├── jsonwebtoken@9.0.2
```

#### 2. Verify Routes Exist
```bash
# Check if routes folder exists
ls routes/

# Expected files:
# - admin.js
# - auth.js
# - members.js
# - payments.js
# - public.js
```

#### 3. Test Database Connection
```bash
# Test MongoDB connection
npm run seed
```

**Expected output** (after ~5 seconds):
```
✅ Database connected
🌱 Seeding database with sample data...
✅ Sample data created successfully
```

**If error**: Check MONGODB_URI in .env file

### Frontend Verification

#### 1. Check Files
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"

# Check HTML files exist
ls *.html

# Expected:
# index.html
# login.html
# portal.html
# forgot-password.html
# reset-password.html
```

#### 2. Check JavaScript Files
```bash
# List JS files
ls *.js

# Expected:
# server.js
# api.js
# auth.js
# config.js
# mock.js
# portal.js
# page.admin.js
# page.*.js
```

#### 3. Check Styles
```bash
# List CSS files
ls *.css

# Expected:
# base.css
# auth.css
# pages.css
# portal.css
# public.css
```

#### 4. Verify Logo Files
```bash
# Check if logo exists
ls logo.* favicon.*

# Expected:
# logo.png
# favicon.png
# favicon.ico
```

---

## 🎬 RUNNING THE APPLICATION

### Terminal Setup

You'll need **2-3 terminals**:
1. **Terminal 1**: MongoDB (if local)
2. **Terminal 2**: Backend server
3. **Terminal 3**: Frontend server

### Method 1: Using Separate Terminals (Easiest)

#### Terminal 1: Start MongoDB (if using local)
```bash
mongod
```

**Expected output**:
```
[initandlisten] waiting for connections on port 27017
```

**Leave this running!**

#### Terminal 2: Start Backend
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm run dev
```

**Expected output** (after ~3 seconds):
```
✅ Database connected to MongoDB
✅ Server running on http://localhost:5000
🔄 Watching for changes with nodemon...
```

**Leave this running!**

#### Terminal 3: Start Frontend
```bash
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
npm run dev
```

**Expected output** (after ~2 seconds):
```
✅ Frontend server running on http://localhost:8000
🔄 Watching for changes with nodemon...
```

**Leave this running!**

### Method 2: Using VS Code Tasks

If you set up VS Code tasks in `.vscode/tasks.json`:

1. Open Command Palette: `Ctrl+Shift+P`
2. Type: "Run Task"
3. Select: "Backend: Start"
4. Open new terminal: `Ctrl+Shift+` (backtick)
5. Run Task: "Frontend: Start"

---

## 🌐 ACCESSING THE APPLICATION

Once all servers are running:

### Public Homepage
- **URL**: http://localhost:8000/index.html
- **What to see**: 
  - Logo at top (with transparent background)
  - Hero section with "Donate Now" button
  - Statistics cards
  - Campaign cards with progress bars

### Login/Register
- **URL**: http://localhost:8000/login.html
- **Features**:
  - Register form for new members
  - Login for existing members
  - Forgot password link

### Member Portal
- **URL**: http://localhost:8000/portal.html
- **Login with**: 
  - Email: `member@test.com` (after seeding)
  - Password: `Test@1234`
- **Features**:
  - Dashboard
  - Profile management
  - Donation page
  - Volunteer portal (if volunteer role)

### Admin Panel
- **URL**: http://localhost:8000/portal.html
- **Login with**:
  - Email: `chairman@test.com` (after seeding)
  - Password: `Test@1234`
- **Features**:
  - User management
  - Campaign management
  - Financial reports
  - Audit logs

---

## 🧪 TESTING API ENDPOINTS

### Using Postman

1. **Open Postman**
2. **Create New Request**
3. **Test Auth Endpoint**:
   ```
   Method: POST
   URL: http://localhost:5000/api/auth/login
   Body (JSON):
   {
     "email": "member@test.com",
     "password": "Test@1234"
   }
   ```

4. **Expected Response**:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "_id": "...",
       "name": "Test Member",
       "email": "member@test.com",
       "role": "member"
     }
   }
   ```

### Using cURL (Command Line)

```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@test.com","password":"Test@1234"}'
```

### Using Frontend UI

1. Go to http://localhost:8000/login.html
2. Click "Register" tab
3. Fill in form:
   - Name: Your Name
   - Email: test@example.com
   - Phone: +254712345678
   - National ID: 12345678
   - Password: Test@1234
4. Click "Register"
5. Check email for verification link (or use mock flow)

---

## 🐛 TROUBLESHOOTING

### Problem 1: "Cannot find module 'express'"

**Cause**: npm install didn't complete

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Problem 2: "ECONNREFUSED - MongoDB connection failed"

**Cause**: MongoDB not running or wrong URI

**Solutions**:

**Option A** (Using MongoDB Atlas):
1. Check connection string in `.env`
2. Verify username/password are correct
3. Verify IP is whitelisted in Atlas

**Option B** (Using Local MongoDB):
```bash
# Start MongoDB
mongod

# Or check if it's already running
netstat -an | grep 27017
```

### Problem 3: "ENOENT: no such file or directory, open '.env'"

**Cause**: .env file doesn't exist

**Solution**:
```bash
# Backend
cd backend
echo "MONGODB_URI=mongodb://localhost:27017/touchofhope" > .env
echo "JWT_SECRET=test_secret_key" >> .env
# ... add other variables

# Frontend
cd ../frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### Problem 4: "Port 5000 already in use"

**Cause**: Backend already running or another app using port

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID with number from above)
kill -9 PID

# Or change port in backend/.env
echo "PORT=5001" >> .env
```

### Problem 5: "Port 8000 already in use"

**Cause**: Frontend already running

**Solution**:
```bash
# Kill process on port 8000
lsof -i :8000 | awk 'NR==2 {print $2}' | xargs kill -9

# Or change port in frontend/server.js (line: const PORT = 8000)
```

### Problem 6: CORS Error in Browser Console

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Cause**: FRONTEND_URL not matching

**Solution**:
1. Update backend `.env`:
   ```
   FRONTEND_URL=http://localhost:8000
   ```
2. Restart backend: `Ctrl+C` then `npm run dev`

### Problem 7: Can't Login to Portal

**Cause**: User not seeded or email not verified

**Solution**:
```bash
# Re-seed database
cd backend
npm run seed

# Use seeded credentials:
# Email: member@test.com
# Password: Test@1234
```

### Problem 8: Logo Not Showing

**Cause**: Wrong file path or logo.png doesn't exist

**Solution**:
```bash
# Check if logo exists
ls "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend\logo.png"

# If not, copy from another location or download
# Ensure it's PNG format with transparent background
```

---

## 📊 VERIFICATION CHECKLIST

After initialization, verify everything works:

- [ ] Node.js v18+ installed
- [ ] npm v9+ installed
- [ ] MongoDB running (local or Atlas connected)
- [ ] Backend dependencies installed (`npm list` shows packages)
- [ ] Frontend dependencies installed
- [ ] Backend `.env` file created with all variables
- [ ] Frontend `.env` file created
- [ ] Backend server starts: `npm run dev` (shows "Database connected")
- [ ] Frontend server starts: `npm run dev` (shows "running on 8000")
- [ ] Public homepage loads: http://localhost:8000/index.html
- [ ] Login page loads: http://localhost:8000/login.html
- [ ] Can login with seeded user (member@test.com / Test@1234)
- [ ] Portal loads after login
- [ ] API endpoint responds: POST to /api/auth/login returns token
- [ ] Logo displays on all pages
- [ ] No console errors in browser
- [ ] Database seed ran successfully

---

## 🎯 NEXT STEPS AFTER INITIALIZATION

1. **Logo Processing** (2-5 minutes):
   - Use Remove.bg to remove white background
   - Replace `frontend/logo.png` with processed version

2. **Run Tests** (2-3 hours):
   - Follow COMPREHENSIVE_TESTING_GUIDE.md
   - Test all 52 endpoints with Postman
   - Test all UI pages

3. **Configure Email** (15 minutes):
   - Set up Gmail app password
   - Update SMTP variables in `.env`
   - Send test email

4. **Configure Payments** (30 minutes):
   - Get Stripe API keys
   - Update STRIPE_SECRET_KEY and PUBLIC_KEY
   - Test payment flow

5. **Deploy to Staging** (1 hour):
   - Follow deployment checklist
   - Test in staging environment
   - Verify all features work

6. **Production Deployment**:
   - Update environment variables for production
   - Deploy to production server
   - Monitor logs for 24 hours

---

## 📞 QUICK REFERENCE

### Command Quick Links

```bash
# Backend Setup
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\backend"
npm install
npm run seed
npm run dev

# Frontend Setup
cd "c:\Users\DUN\Desktop\touchofhope\touch_of_hope 1.3\frontend"
npm install
npm run dev

# Testing
npm test
npm run test:coverage

# Database
# MongoDB local: mongod
# MongoDB Atlas: Use MONGODB_URI from .env
```

### Default URLs
- **Backend API**: http://localhost:5000/api
- **Frontend**: http://localhost:8000
- **Public Page**: http://localhost:8000/index.html
- **Login**: http://localhost:8000/login.html
- **Portal**: http://localhost:8000/portal.html

### Default Test Credentials (after seeding)
```
Member:
  Email: member@test.com
  Password: Test@1234

Secretary:
  Email: secretary@test.com
  Password: Test@1234

Treasurer:
  Email: treasurer@test.com
  Password: Test@1234

Chairman:
  Email: chairman@test.com
  Password: Test@1234
```

---

## 🎓 UNDERSTANDING THE ARCHITECTURE

### Tech Stack
```
Frontend (HTML/CSS/JS)
    ↓ (HTTP REST API)
Backend (Node.js/Express)
    ↓ (Mongoose ODM)
Database (MongoDB)
```

### Data Flow
1. **Frontend**: User interacts with HTML page
2. **JavaScript**: `api.js` makes HTTP request to backend
3. **Backend**: Route handler validates and processes request
4. **Database**: MongoDB stores/retrieves data
5. **Backend**: Returns JSON response
6. **Frontend**: JavaScript displays data on page

### Authentication Flow
1. User enters email/password on login.html
2. Frontend calls `/api/auth/login` endpoint
3. Backend validates password with bcryptjs
4. Backend generates JWT token
5. Frontend stores token in localStorage
6. Frontend includes token in future API requests
7. Backend verifies token with `requireAuth` middleware

---

## 📚 ADDITIONAL RESOURCES

- **Node.js Docs**: https://nodejs.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **MongoDB Manual**: https://docs.mongodb.com/manual/
- **Mongoose Docs**: https://mongoosejs.com/
- **Postman Learning Center**: https://learning.postman.com/
- **JWT Explained**: https://jwt.io/

---

## 🎉 READY TO START!

You now have everything needed to:
1. ✅ Install all dependencies
2. ✅ Configure environment variables
3. ✅ Start all servers
4. ✅ Access the application
5. ✅ Test all features

**Estimated time to full initialization**: 15-30 minutes

---

**Document Version**: 1.0 - Complete Initialization Guide  
**Last Updated**: March 20, 2026  
**Status**: ✅ READY FOR USE

