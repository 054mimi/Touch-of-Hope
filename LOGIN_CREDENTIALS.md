# 🔐 LOGIN CREDENTIALS - Touch of Hope CBO

**Complete list of all test/mock user credentials**

---

## 📋 DEFAULT SEEDED ACCOUNTS

These accounts are created by `npm run seed` command:

### 1️⃣ Chairman Account (ADMIN)
```
Email:    chairman@touchofhope.org
Password: Chairman@2025
Name:     Agnes Akinyi
Role:     Chairman (Full Admin)
Phone:    +254712345678
Status:   Active ✅
Created:  2022-03-10

⚠️ IMPORTANT: Change password immediately after first login!
```

---

## 📦 MOCK DATA ACCOUNTS (Frontend Only - No Login Needed)

These accounts are in `frontend/mock.js` and used for demo/development purposes:

### 2️⃣ Secretary Account
```
Name:         James Ochieng
Email:        secretary@touchofhope.org
Phone:        +254723456789
Role:         Secretary
Membership#:  TOH-0002
Status:       Active ✅
Created:      2022-03-10
```

### 3️⃣ Treasurer Account
```
Name:         Mary Njeri
Email:        treasurer@touchofhope.org
Phone:        +254734567890
Role:         Treasurer
Membership#:  TOH-0003
Status:       Active ✅
Created:      2022-03-10
```

### 4️⃣ Member Account
```
Name:         Faith Wambui
Email:        faith@email.com
Phone:        +254756789012
Role:         Member
Membership#:  TOH-0004
Status:       Inactive ❌
Created:      2025-01-15
```

---

## 🧑‍💼 VOLUNTEER ACCOUNTS (Mock Data)

### 5️⃣ Volunteer #1
```
Name:          Grace Otieno
Email:         grace@email.com
Phone:         +254711222333
Skills:        Teaching, Mentorship
Availability:  Weekends
Status:        Approved ✅
```

### 6️⃣ Volunteer #2
```
Name:          David Mwangi
Email:         david@email.com
Phone:         +254722333444
Skills:        Medical, First Aid
Availability:  Weekdays
Status:        Pending ⏳
```

---

## 🎯 HOW TO USE THESE CREDENTIALS

### For Backend Login (Real Database)
**Only this account works with backend API:**

```bash
Email:    chairman@touchofhope.org
Password: Chairman@2025
```

Use at: `http://localhost:8001/login.html`

### For Frontend Mock Mode (No Database)
**All other accounts are displayed in frontend mock data:**
- Not actual login credentials
- Used for testing UI with different roles
- Data in `frontend/mock.js`
- Displayed on pages when backend is not available

---

## 🔑 PASSWORD REQUIREMENTS

The system enforces these password requirements:

```
✅ Minimum 8 characters
✅ At least 1 uppercase letter (A-Z)
✅ At least 1 lowercase letter (a-z)
✅ At least 1 number (0-9)
✅ At least 1 special character (!@#$%^&*)
```

**Examples of valid passwords:**
- `Chairman@2025` ✅
- `SecurePass#123` ✅
- `MyP@ssw0rd` ✅

---

## 📊 QUICK REFERENCE TABLE

| # | Name | Email | Password | Role | Status | DB |
|---|------|-------|----------|------|--------|-----|
| 1 | Agnes Akinyi | chairman@touchofhope.org | Chairman@2025 | Chairman | ✅ | Real |
| 2 | James Ochieng | secretary@touchofhope.org | N/A | Secretary | ✅ | Mock |
| 3 | Mary Njeri | treasurer@touchofhope.org | N/A | Treasurer | ✅ | Mock |
| 4 | Faith Wambui | faith@email.com | N/A | Member | ❌ | Mock |
| 5 | Grace Otieno | grace@email.com | N/A | Volunteer | ✅ | Mock |
| 6 | David Mwangi | david@email.com | N/A | Volunteer | ⏳ | Mock |

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Test Admin Portal
```
1. Open: http://localhost:8001/login.html
2. Email:    chairman@touchofhope.org
3. Password: Chairman@2025
4. Click Login
5. Should see Admin Dashboard
6. Should see User Management, Campaigns, Reports, etc.
```

### Scenario 2: Test with Mock Data (No Backend)
```
1. Frontend serves mock data automatically when backend unavailable
2. Mock accounts show in dropdowns/displays
3. No login required for mock data
4. All roles visible in demo mode
```

### Scenario 3: Register New Member
```
1. Open: http://localhost:8001/login.html
2. Click "Don't have an account? Sign up"
3. Fill registration form with valid password
4. New account created with 'member' role
5. Can log in with new credentials
```

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```

### Step 2: Seed Database (Creates Chairman Account)
```bash
npm run seed
```

**Expected Output:**
```
✅ Default chairman created: chairman@touchofhope.org / Chairman@2025
⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN
✅ Seed complete
```

### Step 3: Start Frontend Server
```bash
cd frontend
npm run dev
```

### Step 4: Login
- Open: `http://localhost:8001/login.html`
- Use: `chairman@touchofhope.org` / `Chairman@2025`

---

## ⚠️ SECURITY REMINDERS

### 🔴 CRITICAL
- ⚠️ Default password `Chairman@2025` is PUBLIC
- ⚠️ Change immediately after first login
- ⚠️ Never commit real passwords to git
- ⚠️ Use environment variables for production

### 🟡 WARNING
- Mock data in `frontend/mock.js` is for DEMO ONLY
- Volunteer and member accounts not in database
- These are UI mockups, not real accounts
- Real accounts created via registration or seed

### 🟢 SAFE PRACTICES
- Use strong passwords in production
- Rotate credentials regularly
- Don't share default password
- Enable 2FA when available
- Use HTTPS in production

---

## 📝 ROLE PERMISSIONS

### Chairman (Admin)
```
✅ View all data
✅ Manage users (create, edit, delete)
✅ Manage campaigns
✅ Manage events & projects
✅ View reports & analytics
✅ Configure backups
✅ Change system settings
```

### Secretary
```
✅ View campaigns & events (mock)
✅ View members list (mock)
✅ Post announcements (mock)
```

### Treasurer
```
✅ View donation reports (mock)
✅ View financial summaries (mock)
✅ Track payment methods (mock)
```

### Member
```
✅ View public campaigns
✅ Make donations
✅ Volunteer for events
✅ View personal donations
```

---

## 🔄 IF SEED DOESN'T CREATE ACCOUNT

### Problem: "Chairman account already exists"

**Solution:**
```bash
# Delete the existing user
# Open MongoDB Compass or MongoDB Atlas
# Collections > Users
# Delete all documents
# Then run seed again

npm run seed
```

### Problem: Password doesn't match

**Issue:** Pre-save hook hashes password automatically
**Solution:** Password in seed.js is plain text, hashed when saved

---

## 🌐 ENDPOINTS FOR TESTING

### Check API Health
```
GET http://localhost:5000/api/health
```

### Login Endpoint
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "chairman@touchofhope.org",
  "password": "Chairman@2025"
}
```

### Get Current User
```
GET http://localhost:5000/api/members/me
Headers: Authorization: Bearer <token>
```

---

## 📞 TROUBLESHOOTING

### Can't Login?

**Check 1:** Backend running?
```bash
curl http://localhost:5000/api/health
```

**Check 2:** Database connected?
```
Check backend console for: "✅ Connected to MongoDB"
```

**Check 3:** Database seeded?
```bash
npm run seed
```

**Check 4:** Credentials correct?
```
Email:    chairman@touchofhope.org (exactly)
Password: Chairman@2025 (case-sensitive)
```

**Check 5:** Clear browser cache
```
F12 → Application → Clear Storage
Then refresh page
```

### CORS Error on Login?

**Solution:** Check frontend-backend synchronization
```
backend/.env should have:
FRONTEND_URL=http://localhost:8001
```

### "User not found" error?

**Solution:** Seed database
```bash
cd backend
npm run seed
```

---

## 🎓 ACCOUNT CREATION FLOW

### Manual Registration
```
1. Open http://localhost:8001/login.html
2. Click "Sign up" link
3. Fill form:
   - Name: Your Name
   - Email: your@email.com
   - Password: ValidPass@2025
   - Phone: +254712345678
4. Submit
5. Account created in database
6. Can now login
```

### Seeded Account
```
1. Run: npm run seed
2. Account created automatically:
   - chairman@touchofhope.org / Chairman@2025
3. Can login immediately
```

### Mock Account
```
1. No login needed
2. Data in frontend/mock.js
3. Displayed automatically
4. No database record
```

---

## ✅ VERIFICATION CHECKLIST

Before reporting bugs, verify:

- [ ] Backend running: `npm run dev`
- [ ] Frontend running: `npm run dev`
- [ ] Database seeded: `npm run seed`
- [ ] Correct credentials: `chairman@touchofhope.org` / `Chairman@2025`
- [ ] CORS synchronized: `FRONTEND_URL=http://localhost:8001`
- [ ] No browser cache: Clear storage in F12
- [ ] Correct port: `http://localhost:8001/login.html`

---

## 📚 RELATED DOCUMENTATION

- `INITIALIZATION_GUIDE.md` - Full setup guide
- `FRONTEND_BACKEND_SYNC.md` - Port synchronization
- `COMPLETE_STARTUP_GUIDE.md` - Step-by-step startup
- `COMPREHENSIVE_TESTING_GUIDE.md` - Full testing guide

---

**Document Version:** 1.0  
**Last Updated:** March 20, 2026  
**Status:** ✅ Complete

