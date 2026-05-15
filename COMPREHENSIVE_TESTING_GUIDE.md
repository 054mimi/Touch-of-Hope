# 🚀 COMPLETE SYSTEM TESTING GUIDE
## Touch of Hope CBO — Frontend & Backend Verification

**Created:** March 20, 2026  
**Purpose:** Comprehensive testing before production deployment

---

## 📋 Part 1: Backend API Testing with Postman

### Prerequisites
- Postman installed (https://www.postman.com/downloads/)
- Backend running (`npm run dev` in backend folder)
- MongoDB running locally or connected to Atlas

---

## 🔐 1. AUTHENTICATION TESTS

### 1.1 User Registration (Public)
**POST** `http://localhost:5000/api/auth/register`

**Body (JSON):**
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPassword123",
  "phone": "0712345678",
  "nationalId": "12345678"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Registration submitted. Check your email to verify your address..."
}
```

**What to Verify:**
- ✅ User created in database with `isActive: false`
- ✅ `emailVerified: false`
- ✅ Email sent (check console or Gmail inbox)
- ✅ Password is hashed (not in plain text in database)

---

### 1.2 Email Verification (Public)
**GET** `http://localhost:5000/api/auth/verify-email/{TOKEN}`

**How to Get Token:**
1. Check email from step 1.1
2. Find verification link
3. Extract token from URL

**Expected Response:** Redirect to frontend login page with `?verified=1`

**What to Verify:**
- ✅ `emailVerified: true` in database
- ✅ `emailVerifyToken: null` (cleared)
- ✅ User still has `isActive: false` (needs admin approval)

---

### 1.3 User Login (Public)
**POST** `http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "chairman@touchofhope.org",
  "password": "Chairman@2025"
}
```

**Expected Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Chairman",
    "role": "chairman",
    "email": "chairman@touchofhope.org",
    "membershipNo": "TOH-0001"
  }
}
```

**What to Verify:**
- ✅ Token is a valid JWT
- ✅ User object contains all fields
- ✅ User must be `isActive: true`
- ✅ User must have `emailVerified: true`

---

### 1.4 Get Current User Info (Authenticated)
**GET** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer {TOKEN_FROM_LOGIN}
Content-Type: application/json
```

**Expected Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Chairman",
  "email": "chairman@touchofhope.org",
  "role": "chairman",
  "phone": "0712345678",
  "isActive": true,
  "emailVerified": true
}
```

**What to Verify:**
- ✅ No `passwordHash` returned
- ✅ All user fields present
- ✅ Matches logged-in user

---

### 1.5 Change Password (Authenticated)
**POST** `http://localhost:5000/api/auth/change-password`

**Headers:**
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "oldPassword": "Chairman@2025",
  "newPassword": "NewPassword123"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**What to Verify:**
- ✅ Old password must be correct
- ✅ New password is hashed in database
- ✅ Can login with new password

---

## 💰 2. PAYMENT TESTS

### 2.1 Get Stripe Publishable Key
**GET** `http://localhost:5000/api/payments/stripe/publishable-key`

**Expected Response:** `200 OK`
```json
{
  "key": "pk_test_..."
}
```

---

### 2.2 Stripe: Create Payment Intent
**POST** `http://localhost:5000/api/payments/stripe/create-intent`

**Headers:**
```
Authorization: Bearer {TOKEN} (optional)
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 23,
  "currency": "kes",
  "campaignId": null,
  "donorName": "Test Donor",
  "donorEmail": "donor@test.com"
}
```

**Expected Response:** `200 OK`
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "donationId": "507f1f77bcf86cd799439011"
}
```

**What to Verify:**
- ✅ Donation created with `status: pending`
- ✅ Amount saved correctly as **23** (not 1000)
- ✅ `clientSecret` is valid for client-side payment
- ✅ Webhook will update status to `completed` when Stripe calls it

---

### 2.3 M-Pesa: Initiate STK Push
**POST** `http://localhost:5000/api/payments/mpesa/initiate`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "phone": "254712345678",
  "amount": 23,
  "campaignId": null,
  "donorName": "Test Donor",
  "donorEmail": "donor@test.com"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "STK Push sent. Check your phone and enter your M-Pesa PIN.",
  "checkoutId": "WEB_xxx",
  "donationId": "507f1f77bcf86cd799439011"
}
```

**What to Verify:**
- ✅ Donation created with correct amount (**23**, not 1000)
- ✅ Phone number format validated
- ✅ `checkoutId` stored for status polling

---

### 2.4 M-Pesa: Check Payment Status
**GET** `http://localhost:5000/api/payments/mpesa/status/{CHECKOUT_ID}`

**Expected Response:** `200 OK`
```json
{
  "status": "pending",
  "amount": 23,
  "receipt": "MPE123456",
  "campaign": null
}
```

**What to Verify:**
- ✅ Amount returned correctly as **23**
- ✅ Status tracks properly

---

### 2.5 PayPal: Create Order
**POST** `http://localhost:5000/api/payments/paypal/create-order`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 50,
  "currency": "USD",
  "campaignId": null,
  "donorName": "Test Donor",
  "donorEmail": "donor@test.com"
}
```

**Expected Response:** `200 OK`
```json
{
  "orderId": "...",
  "approveUrl": "https://sandbox.paypal.com/...",
  "donationId": "..."
}
```

**What to Verify:**
- ✅ Donation created with amount converted correctly

---

### 2.6 Manual Donation (Treasurer Only)
**POST** `http://localhost:5000/api/payments/manual`

**Headers:**
```
Authorization: Bearer {TREASURER_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "donorName": "Jane Doe",
  "donorEmail": "jane@example.com",
  "amount": 5000,
  "method": "bank",
  "reference": "BANK-REF-001",
  "date": "2026-03-20",
  "notes": "Bank transfer from personal account"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Donation recorded",
  "id": "..."
}
```

**What to Verify:**
- ✅ Amount saved correctly
- ✅ Status automatically set to `completed`
- ✅ `recordedBy` field shows treasurer ID
- ✅ Only treasurer+ can access this endpoint

---

## 📊 3. ADMIN CRUD TESTS

### 3.1 Get All Users
**GET** `http://localhost:5000/api/admin/users`

**Headers:**
```
Authorization: Bearer {SECRETARY_TOKEN}
```

**Expected Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "User",
    "email": "user@example.com",
    "role": "member",
    "phone": "0712345678",
    "isActive": false,
    "createdAt": "2026-03-20T..."
  }
]
```

**What to Verify:**
- ✅ No `passwordHash` in response
- ✅ All user objects returned
- ✅ Only secretary+ can access

---

### 3.2 Approve User
**PUT** `http://localhost:5000/api/admin/users/{USER_ID}/approve`

**Headers:**
```
Authorization: Bearer {SECRETARY_TOKEN}
```

**Expected Response:** `200 OK`
```json
{
  "message": "User approved and notified by email"
}
```

**What to Verify:**
- ✅ User's `isActive` changed to `true`
- ✅ Email sent to user
- ✅ AuditLog created with action `APPROVE_USER`

---

### 3.3 Change User Role
**PUT** `http://localhost:5000/api/admin/users/{USER_ID}/role`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "role": "volunteer"
}
```

**Expected Response:** `200 OK`

**What to Verify:**
- ✅ User's `role` updated
- ✅ AuditLog created
- ✅ Only chairman can do this

---

### 3.4 Suspend User
**PUT** `http://localhost:5000/api/admin/users/{USER_ID}/suspend`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
```

**Expected Response:** `200 OK`

**What to Verify:**
- ✅ User's `isActive` set to `false`
- ✅ User can no longer login
- ✅ AuditLog created

---

### 3.5 Create Campaign
**POST** `http://localhost:5000/api/admin/campaigns`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "School Supplies Drive 2026",
  "description": "Help us provide school supplies to underprivileged children",
  "targetAmount": 100000,
  "endDate": "2026-06-30"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Campaign created",
  "id": "..."
}
```

**What to Verify:**
- ✅ Campaign created in database
- ✅ `createdBy` set to current user
- ✅ `amountRaised` defaults to 0
- ✅ `percentageRaised` virtual field works
- ✅ Only chairman can create

---

### 3.6 Update Campaign
**PUT** `http://localhost:5000/api/admin/campaigns/{CAMPAIGN_ID}`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Campaign Title",
  "status": "completed"
}
```

**Expected Response:** `200 OK`

---

### 3.7 Delete Campaign
**DELETE** `http://localhost:5000/api/admin/campaigns/{CAMPAIGN_ID}`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
```

**Expected Response:** `200 OK`

---

### 3.8 Create Event
**POST** `http://localhost:5000/api/admin/events`

**Headers:**
```
Authorization: Bearer {SECRETARY_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Community Cleanup",
  "eventDate": "2026-04-15T09:00:00Z",
  "location": "Kibera, Nairobi",
  "requiredVolunteers": 20,
  "description": "Help us clean up the community"
}
```

**Expected Response:** `201 Created`

**What to Verify:**
- ✅ Event created
- ✅ `createdBy` set to current user
- ✅ Only secretary+ can create

---

### 3.9 Get All Events
**GET** `http://localhost:5000/api/admin/events`

**Headers:**
```
Authorization: Bearer {SECRETARY_TOKEN}
```

**Expected Response:** `200 OK` (array of events)

---

### 3.10 Create Project
**POST** `http://localhost:5000/api/admin/projects`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Water Well Installation",
  "location": "Mathare, Nairobi",
  "startDate": "2026-04-01",
  "status": "active",
  "description": "Installing water wells in underserved areas",
  "impactSummary": "Serves 500+ families"
}
```

**Expected Response:** `201 Created`

---

### 3.11 Create Announcement
**POST** `http://localhost:5000/api/admin/announcements`

**Headers:**
```
Authorization: Bearer {SECRETARY_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Monthly Meeting on Saturday",
  "content": "Please join us for our monthly meeting on Saturday at 10 AM. Topics: Q2 fundraising, new projects.",
  "isPublic": true
}
```

**Expected Response:** `201 Created`

---

### 3.12 Get All Announcements
**GET** `http://localhost:5000/api/admin/announcements`

**Headers:**
```
Authorization: Bearer {SECRETARY_TOKEN}
```

**Expected Response:** `200 OK` (array)

---

## 📈 4. FINANCIAL REPORTS

### 4.1 Financial Summary
**GET** `http://localhost:5000/api/admin/reports/financial?from=2026-01-01&to=2026-12-31`

**Headers:**
```
Authorization: Bearer {TREASURER_TOKEN}
```

**Expected Response:** `200 OK`
```json
{
  "byMethod": [
    { "_id": "stripe", "count": 5, "total": 2500 },
    { "_id": "mpesa", "count": 3, "total": 1500 }
  ],
  "byCampaign": [
    { "_id": "campaign_id", "campaign": [...], "total": 2000 }
  ],
  "monthly": [
    { "_id": "2026-03", "total": 4000 }
  ],
  "summary": {
    "total": 4000,
    "count": 8,
    "avg": 500
  }
}
```

**What to Verify:**
- ✅ `total` correctly sums all donations
- ✅ Methods breakdown shows correct amounts per method
- ✅ `average` calculation is accurate
- ✅ Only treasurer+ can access

---

### 4.2 Donation List (Paginated)
**GET** `http://localhost:5000/api/admin/reports/donations?page=1&limit=10&status=completed&method=stripe`

**Headers:**
```
Authorization: Bearer {TREASURER_TOKEN}
```

**Expected Response:** `200 OK`
```json
{
  "donations": [
    {
      "_id": "...",
      "donorName": "John Doe",
      "amount": 23,
      "currency": "KES",
      "paymentMethod": "stripe",
      "status": "completed",
      "createdAt": "2026-03-20T..."
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

**What to Verify:**
- ✅ Donations with amount **23** show correctly
- ✅ Pagination works
- ✅ Filters by status and method work
- ✅ Amounts are accurate

---

## 🔐 5. AUDIT LOGS

### 5.1 Get Audit Logs
**GET** `http://localhost:5000/api/admin/audit-logs`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
```

**Expected Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "user": { "name": "Chairman", "email": "..." },
    "action": "APPROVE_USER",
    "details": "Approved user@example.com",
    "ipAddress": "127.0.0.1",
    "createdAt": "2026-03-20T..."
  }
]
```

**What to Verify:**
- ✅ All admin actions are logged
- ✅ User information included
- ✅ Timestamps correct
- ✅ Only chairman can access

---

## 📦 6. BACKUP SYSTEM

### 6.1 Get Backup Config
**GET** `http://localhost:5000/api/admin/backup/config`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
```

**Expected Response:** `200 OK`
```json
{
  "frequency": "daily",
  "backupTime": "02:00",
  "localEnabled": true,
  "cloudEnabled": false,
  "retentionDays": 30
}
```

---

### 6.2 Update Backup Config
**PUT** `http://localhost:5000/api/admin/backup/config`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "frequency": "weekly",
  "backupTime": "03:00",
  "localEnabled": true,
  "retentionDays": 60
}
```

**Expected Response:** `200 OK`

**What to Verify:**
- ✅ Config updated
- ✅ Cron job rescheduled
- ✅ AuditLog created

---

### 6.3 Run Manual Backup
**POST** `http://localhost:5000/api/admin/backup/run`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Backup complete",
  "filename": "toh_backup_manual_2026-03-20T...",
  "sizeBytes": 1024000
}
```

**What to Verify:**
- ✅ Backup file created
- ✅ BackupHistory record created
- ✅ File size > 0

---

### 6.4 List Backups
**GET** `http://localhost:5000/api/admin/backup/list`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
```

**Expected Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "filename": "toh_backup_manual_2026-03-20T...",
    "sizeBytes": 1024000,
    "status": "success",
    "triggeredBy": "manual",
    "createdAt": "2026-03-20T..."
  }
]
```

---

### 6.5 Restore from Backup
**POST** `http://localhost:5000/api/admin/backup/restore`

**Headers:**
```
Authorization: Bearer {CHAIRMAN_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "backupId": "..."
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Database restored successfully",
  "from": "toh_backup_..."
}
```

**What to Verify:**
- ✅ Database restored
- ✅ Pre-restore safety snapshot created
- ✅ AuditLog created with action `DB_RESTORE`

---

## ✅ CRITICAL AMOUNT VERIFICATION TESTS

### Test Case: KSh 23 Donation
1. Go to Donate page
2. Select M-Pesa
3. Enter amount: **23**
4. Confirm payment shows **KSh 23** (not 1000)
5. After donation, go to Admin → Finances
6. Verify report shows **23**, not 1000
7. Click "View Donations" and confirm **23** appears

### Expected Results
- ✅ Frontend shows **23**
- ✅ Backend saves **23** to database
- ✅ Reports calculate with **23**
- ✅ Financial summary adds **23** to total

### Testing Multiple Amounts
Repeat above with:
- 500 KES
- 1000 KES
- 23 KES (minimum test)
- 10000 KES

**All should display and calculate correctly!**

---

## 📄 Part 2: Frontend UI/UX Testing

### Page Structure Tests

**1. Public Website (No Login Required)**
- [ ] `/index.html` loads
- [ ] Navigation works
- [ ] Stats display correctly
- [ ] Campaigns list shows
- [ ] Donate button navigates to login
- [ ] Logo appears properly
- [ ] Mobile responsive

**2. Login Page**
- [ ] `/login.html` loads
- [ ] Login form works
- [ ] Register tab opens
- [ ] Forgot password link works
- [ ] Error messages appear on invalid submit
- [ ] Successful login redirects to portal

**3. Portal (After Login)**
- [ ] `/portal.html` loads
- [ ] Sidebar navigation works
- [ ] User role determines menu items
- [ ] Dashboard page loads
- [ ] Profile page works
- [ ] Logout works

**4. Admin Pages**
- [ ] Users page loads and displays all users
- [ ] Approve button works and user is activated
- [ ] Role dropdown changes roles
- [ ] Campaigns page shows created campaigns
- [ ] Create campaign button opens modal
- [ ] Campaign deletion confirms
- [ ] Events page works similarly
- [ ] Projects page works similarly
- [ ] Announcements page works
- [ ] Financial reports display accurate totals

**5. Donation Page**
- [ ] Campaign selection works
- [ ] Amount input validates (min 10)
- [ ] Payment method selector works
- [ ] M-Pesa form shows/hides correctly
- [ ] Stripe form shows/hides correctly
- [ ] PayPal button works
- [ ] Success notifications show

**6. Data Sync Tests**
- [ ] Create campaign in admin
- [ ] Public page refreshes and shows new campaign
- [ ] Donate page shows new campaign
- [ ] After donation, admin finances updates
- [ ] Profile shows donated amount
- [ ] Campaign progress bar updates

---

## 🎯 Data Flow Verification Matrix

| Action | Frontend Updates | Backend Stores | Database Saves | Reports Show | Correct Amount |
|--------|-----------------|-----------------|--------|---------|--------|
| Register user | ✅ Form clears | ✅ User created | ✅ isActive=false | N/A | N/A |
| Approve user | ✅ Badge updates | ✅ isActive=true | ✅ Email sent | ✅ Audit | N/A |
| Create campaign | ✅ List updates | ✅ POST /admin/campaigns | ✅ Campaign doc | ✅ Public page | N/A |
| M-Pesa 23 KES | ✅ Status updates | ✅ POST /mpesa/initiate | ✅ Donation: 23 | ✅ Shows 23 | **23** |
| Stripe 23 KES | ✅ Success shows | ✅ POST /stripe/intent | ✅ Donation: 23 | ✅ Shows 23 | **23** |
| Manual 5000 KES | ✅ Receipt shows | ✅ POST /manual | ✅ Donation: 5000 | ✅ Shows 5000 | **5000** |

---

## 🚨 Common Issues Checklist

**If amount shows wrong:**
- [ ] Check database: `db.donations.find()` → verify amount field
- [ ] Check form: `document.getElementById('pay-amount').value` → should be entered amount
- [ ] Check Postman: Send same amount via API
- [ ] Check conversion: For PayPal only, convert KES→USD (÷110)

**If donation doesn't appear in reports:**
- [ ] Check status: Must be `completed` not `pending`
- [ ] Check database: `db.donations.find({status: "completed"})`
- [ ] Check timestamps: Date filters in reports
- [ ] Check aggregation: Run report API manually in Postman

**If user can't login after approval:**
- [ ] Check `isActive: true`
- [ ] Check `emailVerified: true`
- [ ] Check password hash saved correctly
- [ ] Check token generation working

---

## 📋 Sign-Off Checklist

Complete this checklist before production:

- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] Amount verification passes (23 KSH = 23, not 1000)
- [ ] Payment methods (all 4) work
- [ ] Financial reports show correct totals
- [ ] Data syncs between frontend, backend, database
- [ ] Role-based access control enforced
- [ ] Audit logs track admin actions
- [ ] Backup/restore works
- [ ] Error messages are helpful
- [ ] Mobile responsive
- [ ] Performance acceptable (< 3s load time)
- [ ] No console errors
- [ ] No security warnings

---

## 🎓 Troubleshooting

**Postman Tips:**
1. Set `{{API}}` variable to `http://localhost:5000/api`
2. Save tokens in Postman environment for reuse
3. Use "Pre-request Script" to add timestamps for unique emails
4. Use "Tests" tab to validate responses automatically

**Frontend Debug:**
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab to see API calls
4. Check Application tab for localStorage tokens

**Backend Debug:**
1. Check terminal for error messages
2. Check MongoDB directly: `mongosh` → `use touch_of_hope`
3. Add `console.log()` in routes to trace execution
4. Use Postman to test each endpoint independently

---

**ALL TESTS MUST PASS BEFORE GOING LIVE! ✅**
