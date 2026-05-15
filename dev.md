# Touch of Hope CBO — Developer Documentation

**Stack:** MongoDB · Express · Vanilla JS · Node.js (MERN)
**Version:** 2.0.0 · **Last updated:** March 2026

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Prerequisites](#2-prerequisites)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables](#4-environment-variables)
5. [Database Setup (MongoDB)](#5-database-setup-mongodb) //line 305
6. [Payment Integrations](#6-payment-integrations) //line 353
7. [Email Setup](#7-email-setup) //line 488
8. [Frontend Integration](#8-frontend-integration) //line 544
9. [API Reference](#9-api-reference) //line 596
10. [Authentication and Roles](#10-authentication-and-roles) //line 686
11. [Backup System](#11-backup-system) //line 719
12. [Deployment (Production)](#12-deployment-production) //line 772
13. [GitHub Setup and Push](#13-github-setup-and-push) //line 903
14. [Troubleshooting](#14-troubleshooting) //line 975

---

## 1. Project Structure

```
touch-of-hope/
│
├── backend/                    <- Express/Node.js API server
│   ├── server.js               <- Entry point, middleware, route mounting
│   ├── package.json
│   ├── .env                    <- YOUR secrets (NEVER commit this file)
│   ├── .env.example            <- Template — safe to commit
│   ├── config/
│   │   └── db.js               <- MongoDB connection with reconnect handling
│   ├── models/
│   │   ├── User.js             <- Users, password hashing, email verify
│   │   ├── Campaign.js         <- Fundraising campaigns + % raised virtual
│   │   ├── Donation.js         <- Payments (all methods), auto-updates campaign totals
│   │   └── index.js            <- Event, Project, Announcement, AuditLog, BackupConfig, BackupHistory
│   ├── middleware/
│   │   └── auth.js             <- JWT verification + requireRole() guard
│   ├── routes/
│   │   ├── auth.js             <- /api/auth/* (register, login, verify, reset)
│   │   ├── public.js           <- /api/public/* (no auth, drives public website)
│   │   ├── members.js          <- /api/members/* (self-service portal)
│   │   ├── payments.js         <- /api/payments/* (Stripe, M-Pesa, PayPal, manual)
│   │   └── admin.js            <- /api/admin/* (users, content, finances, backup)
│   └── utils/
│       ├── email.js            <- Nodemailer + HTML email templates
│       └── seed.js             <- Seeds default chairman account
│
└── frontend/                   <- Static files, all flat in one folder
    ├── index.html              <- Public website
    ├── login.html              <- Login + register
    ├── portal.html             <- Authenticated portal (all roles)
    ├── forgot-password.html    <- Password reset request
    ├── reset-password.html     <- Password reset form (takes ?token=)
    ├── config.js               <- API_URL, role nav definitions, page titles
    ├── mock.js                 <- Demo/offline fallback data + mockData()
    ├── api.js                  <- fetch() wrapper with auto-fallback to mock
    ├── auth.js                 <- Tab switching, password validation helper
    ├── portal.js               <- View switching, sidebar builder, navigate()
    ├── page.public.js          <- Public site loader
    ├── page.dashboard.js       <- Dashboard stats
    ├── page.profile.js         <- Profile, change password
    ├── page.donate.js          <- Stripe, M-Pesa, PayPal payment flows
    ├── page.admin.js           <- Users, campaigns, events, projects, etc.
    ├── page.backup.js          <- Backup manager
    ├── page.constitution.js    <- Constitution accordion
    ├── base.css                <- Design tokens, reset, all shared components
    ├── public.css              <- Public website styles
    ├── auth.css                <- Login/register page
    ├── portal.css              <- Sidebar, topbar, layout
    ├── pages.css               <- Page-specific (donate, backup)
    ├── logo.png                <- Logo with transparent background
    ├── favicon.ico
    └── favicon.png
```

---

## 2. Prerequisites

Install all of the following before starting:

| Tool | Minimum Version | Download |
|------|----------------|----------|
| Node.js | 18 LTS | https://nodejs.org |
| npm | 9.x (comes with Node) | — |
| MongoDB Community | 7.x | https://www.mongodb.com/try/download/community |
| MongoDB Database Tools | latest | https://www.mongodb.com/try/download/database-tools |
| Git | any | https://git-scm.com |

Verify each is installed:

```bash
node -v           # v18.x.x or higher
npm -v            # 9.x.x or higher
mongod --version  # db version v7.x.x
mongodump --version
git --version
```

---

## 3. Local Development Setup

### Step 1 — Get the code

```bash
# Extract the downloaded zip:
unzip touch-of-hope.zip
cd touch-of-hope

# OR clone from GitHub once you have pushed it:
git clone https://github.com/YOUR_USERNAME/touch-of-hope.git
cd touch-of-hope
```

### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

This installs: express, mongoose, bcryptjs, jsonwebtoken, nodemailer, stripe, cors, helmet, express-rate-limit, express-validator, node-cron, multer, dotenv, and nodemon.

### Step 3 — Create your .env file

```bash
cp .env.example .env
```

Open `.env` in any text editor. At minimum, set these three values to get started locally:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/touch_of_hope
JWT_SECRET=replace_this_with_any_long_random_string_64_chars_minimum
FRONTEND_URL=http://localhost:5500
```

All other variables (payment keys, email credentials) can be added later as needed. The system works in demo mode without them.

### Step 4 — Start MongoDB

```bash
# macOS (with Homebrew):
brew services start mongodb-community

# Ubuntu / Debian:
sudo systemctl start mongod

# Windows (run in Administrator PowerShell):
net start MongoDB

# Manual (any OS):
mongod --dbpath /data/db
```

Check MongoDB is running:

```bash
mongosh
# You should see a mongosh prompt. Type: exit
```

### Step 5 — Seed the database

```bash
# Still inside backend/ folder:
node utils/seed.js
```

Expected output:
```
✅ MongoDB connected: localhost
✅ Default chairman created: chairman@touchofhope.org / Chairman@2025
   ⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN
✅ Default backup config created
✅ Seed complete
```

### Step 6 — Start the backend server

```bash
# Development mode (auto-restarts on code changes):
npm run dev

# Production mode:
npm start
```

Expected output:
```
✅ MongoDB connected: localhost
🚀 Touch of Hope API running on http://localhost:5000
   Env:      development
   MongoDB:  localhost
   Frontend: http://localhost:5500
```

### Step 7 — Serve the frontend

The frontend cannot be opened as a local file (file:// causes CORS errors). Use one of these options:

**Option A — VS Code Live Server (recommended):**
1. Install the "Live Server" extension in VS Code
2. Open the `frontend/` folder in VS Code
3. Right-click `index.html` → Open with Live Server
4. It opens at `http://localhost:5500`

**Option B — Python:**
```bash
cd frontend
python3 -m http.server 5500
```

**Option C — npx serve:**
```bash
cd frontend
npx serve -p 5500
```

### Step 8 — Verify it all works

```bash
# Test API health:
curl http://localhost:5000/api/health
# Expected: {"status":"ok","time":"...","env":"development"}

# Test public data:
curl http://localhost:5000/api/public/overview
```

Then open `http://localhost:5500` in a browser. The public site loads. Click Donate/Login and sign in with `chairman@touchofhope.org` / `Chairman@2025`.

---

## 4. Environment Variables

Full reference for `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500

# MongoDB (local for dev, Atlas URI for production)
MONGODB_URI=mongodb://localhost:27017/touch_of_hope

# JWT — use a long random string, minimum 64 characters
JWT_SECRET=change_this_completely_use_openssl_rand_hex_64
JWT_EXPIRES_IN=8h

# Email — Gmail App Password setup:
# 1. Google Account > Security > 2-Step Verification (enable)
# 2. Security > App Passwords > Mail > Generate
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@touchofhope.org
SMTP_PASS=xxxx_xxxx_xxxx_xxxx
EMAIL_FROM="Touch of Hope CBO <noreply@touchofhope.org>"

# Stripe — https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# M-Pesa — https://developer.safaricom.co.ke
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENV=sandbox
API_BASE_URL=https://your-public-api-url.com

# PayPal — https://developer.paypal.com/dashboard/applications
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_ENV=sandbox

# Backup
BACKUP_LOCAL_DIR=./backups
RETENTION_DAYS=30
CLOUD_PROVIDER=gcs
CLOUD_BUCKET=toh-backups-2025
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Database Setup (MongoDB)

### Local development

MongoDB creates the database and all collections automatically when the app first writes data. No manual setup needed beyond running `mongod` and seeding.

### MongoDB Atlas (recommended for production)

1. Create a free account at https://cloud.mongodb.com
2. Create Project → Build a Database → Free Tier (M0)
3. Choose a cloud provider and region (recommend AWS af-south-1 for Kenya)
4. Set a database username and password — save these
5. Network Access → Add IP Address → 0.0.0.0/0 (allow all) or your server IP
6. Database → Connect → Drivers → copy the connection string
7. Replace `<password>` and `<dbname>` in the string
8. Set as `MONGODB_URI` in `.env`

Example Atlas URI:
```
mongodb+srv://tohuser:SecretPass123@cluster0.abc12.mongodb.net/touch_of_hope?retryWrites=true&w=majority
```

### Useful database commands

```bash
# Open Mongo shell
mongosh

# Switch to app database
use touch_of_hope

# Count documents per collection
db.users.countDocuments()
db.donations.countDocuments()

# Find all users (pretty-printed)
db.users.find({}, {passwordHash:0}).pretty()

# Find pending users
db.users.find({isActive:false}).pretty()

# Find all completed donations
db.donations.find({status:'completed'}).pretty()

# Drop database (CAUTION — deletes everything)
db.dropDatabase()
```

---

## 6. Payment Integrations

### 6.1 Stripe — Cards, Apple Pay, Google Pay, Bank Redirects

Stripe is the most comprehensive payment gateway and handles the widest variety of payment methods.

**What it supports:** Visa, Mastercard, Amex, Apple Pay, Google Pay, SEPA bank transfers, and more depending on region.

**Setup:**

1. Create account at https://stripe.com
2. Dashboard → Developers → API Keys → copy Test Secret Key and Test Publishable Key
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
   ```

4. Set up webhook for payment confirmation (required for donations to be marked complete):

   **During development — Stripe CLI:**
   ```bash
   # Install: https://stripe.com/docs/stripe-cli#install
   stripe login
   stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
   # Copy the "whsec_..." value printed and add to .env as STRIPE_WEBHOOK_SECRET
   # Leave this running in a terminal while developing
   ```

   **For production — Stripe Dashboard:**
   - Developers → Webhooks → Add endpoint
   - URL: `https://api.yourdomain.com/api/payments/stripe/webhook`
   - Events: `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

**Payment flow in detail:**
```
1. Donor clicks Pay → frontend calls POST /api/payments/stripe/create-intent
2. Backend creates a Stripe PaymentIntent, returns client_secret to frontend
3. Frontend loads Stripe.js, mounts the payment element (card form / Apple Pay)
4. Donor fills in details and clicks confirm
5. Stripe processes the payment and calls the webhook
6. Backend marks donation as completed, sends receipt email
```

**Go live:** Replace test keys (`sk_test_`, `pk_test_`) with live keys (`sk_live_`, `pk_live_`) from the Stripe Dashboard.

---

### 6.2 M-Pesa — Safaricom Daraja STK Push

M-Pesa sends a push notification to the donor's phone asking them to enter their PIN.

**Setup:**

1. Create account at https://developer.safaricom.co.ke
2. Go to My Apps → Create App → enable Lipa Na M-Pesa Online
3. Copy Consumer Key and Consumer Secret from the app credentials
4. Add to `.env`

**Critical: M-Pesa requires a publicly reachable callback URL**

The Safaricom servers must be able to call your API after payment. For local development, use ngrok:

```bash
# Download ngrok: https://ngrok.com/download
ngrok http 5000
# You get a URL like https://abc123.ngrok-free.app
# Set this as API_BASE_URL in .env:
API_BASE_URL=https://abc123.ngrok-free.app
# Restart the backend server after changing .env
```

**Phone number format:** Must be `254XXXXXXXXX` — 254 prefix, no plus sign, no leading zero.
- `0712345678` → enter as `254712345678`

**Payment flow:**
```
1. Donor enters phone number and amount
2. Frontend calls POST /api/payments/mpesa/initiate
3. Backend calls Safaricom STK Push API
4. Donor receives PIN prompt on phone
5. Donor enters PIN within 60 seconds
6. Safaricom calls POST /api/payments/mpesa/callback on the backend
7. Backend marks donation complete, sends receipt email
8. Frontend polls GET /api/payments/mpesa/status/:checkoutId every 8 seconds
```

**Go live:**
1. Apply for production access on the Safaricom Developer Portal (requires business documents)
2. Change `MPESA_ENV=production` in `.env`
3. Replace shortcode and passkey with your live Paybill/Till credentials
4. Update `API_BASE_URL` to your live server URL

---

### 6.3 PayPal

PayPal processes payments in USD. The frontend estimates the USD amount by dividing KES by 110 (approximate rate). For accuracy in production, consider integrating a live exchange rate API.

**Setup:**

1. Create account at https://developer.paypal.com
2. Dashboard → Apps & Credentials → Create App (Sandbox)
3. Copy Client ID and Secret
4. Add to `.env`:
   ```env
   PAYPAL_CLIENT_ID=xxxx
   PAYPAL_CLIENT_SECRET=xxxx
   PAYPAL_ENV=sandbox
   ```

**Payment flow:**
```
1. Donor clicks Pay with PayPal
2. Frontend calls POST /api/payments/paypal/create-order
3. Backend creates PayPal order, returns approval URL
4. Frontend opens PayPal popup in a new tab
5. Donor logs in to PayPal and approves
6. Frontend polls POST /api/payments/paypal/capture-order every 5 seconds
7. Backend captures payment, marks donation complete, sends receipt
```

**Go live:** Switch to Live credentials from the PayPal Dashboard and set `PAYPAL_ENV=production`.

---

### 6.4 Bank Transfer (Manual Recording)

No API integration needed. Bank details are shown to the donor. The treasurer then manually records the donation in the portal:

**Portal → Finances → Record Donation → select Bank or Cash as method**

---

## 7. Email Setup

### Gmail App Password (recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Google Account → Security → 2-Step Verification → App Passwords
3. Select "Mail" as the app and generate a password
4. Copy the 16-character password into `SMTP_PASS` in `.env`

Example configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@touchofhope.org
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM="Touch of Hope CBO <noreply@touchofhope.org>"
```

### Other SMTP providers

| Provider | SMTP Host | Port |
|----------|-----------|------|
| Gmail | smtp.gmail.com | 587 |
| Zoho Mail | smtp.zoho.com | 587 |
| Office 365 | smtp.office365.com | 587 |
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |

### Emails sent by the system

| Trigger | Template | Recipient |
|---------|----------|-----------|
| New registration | verifyEmail | New user |
| New registration | newMemberNotify | Chairman |
| Account approved | welcomeApproved | Approved user |
| Forgot password | resetPassword | User |
| Successful donation (any method) | donationReceipt | Donor |

### Test email sending

```bash
cd backend
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
t.verify().then(() => console.log('✅ SMTP connected OK')).catch(e => console.error('❌', e.message));
"
```

---

## 8. Frontend Integration

### Connecting to the backend

In `frontend/config.js`, change the API constant on line 6:

```javascript
// Development (local):
const API = 'http://localhost:5000/api';

// Production:
const API = 'https://api.touchofhope.org/api';
```

### How api() works

All data fetching goes through the central `api()` function in `api.js`. It automatically adds the auth token and falls back to demo data if the server is unreachable:

```javascript
// No auth:
api('GET', '/public/overview', null, false)

// With auth (uses stored token automatically):
api('GET', '/members/me')

// POST with body:
api('POST', '/admin/campaigns', { title: 'New Campaign', targetAmount: 50000 })

// DELETE:
api('DELETE', `/admin/campaigns/${id}`)
```

If the backend cannot be reached, `api()` calls `mockData(method, path)` from `mock.js` and returns demo data instead of throwing an error. This allows the frontend to work in demo mode without any backend.

### CORS

The backend allows requests from `FRONTEND_URL` in `.env`. If you change the port the frontend runs on, update `FRONTEND_URL` and restart the backend.

### Adding a new portal page

1. Add nav item to `NAV_BY_ROLE` in `config.js` for the correct roles
2. Add `<div class="page" id="page-yourpage">` HTML in `portal.html`
3. Add page title to `PAGE_TITLES` in `config.js`
4. Add a `case` in `loadPage()` in `portal.js`:
   ```javascript
   case 'yourpage': return loadYourPage();
   ```
5. Create `frontend/page.yourpage.js` with a `loadYourPage()` function
6. Add `<script src="page.yourpage.js"></script>` at the bottom of `portal.html`

---

## 9. API Reference

All endpoints are prefixed with `/api`. Protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

### Auth `/api/auth`

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| POST | `/register` | No | Register new member; sends verification email |
| GET | `/verify-email/:token` | No | Confirm email; redirects to login |
| POST | `/login` | No | Returns JWT + user object |
| POST | `/forgot-password` | No | Sends reset link by email |
| POST | `/reset-password` | No | Sets new password using reset token |
| POST | `/change-password` | Member | Change password (requires old password) |
| GET | `/me` | Member | Returns current user object |

### Public `/api/public`

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| GET | `/overview` | No | All public data: stats, campaigns, events, projects, announcements |
| GET | `/campaigns` | No | Active campaigns list |
| GET | `/campaign/:id` | No | Single campaign detail |

### Members `/api/members`

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| GET | `/me` | Member | Own profile + donations + joined events |
| PUT | `/me` | Member | Update own name and phone |
| POST | `/volunteer-apply` | Member | Submit volunteer application |
| GET | `/volunteer-events/mine` | Volunteer | Events I am registered for |
| GET | `/volunteer-events/available` | Volunteer | Upcoming events I can join |
| POST | `/volunteer-events/:id/join` | Volunteer | Register for an event |

### Payments `/api/payments`

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| GET | `/stripe/publishable-key` | No | Frontend fetches this to init Stripe.js |
| POST | `/stripe/create-intent` | Optional | Creates PaymentIntent; returns client_secret |
| POST | `/stripe/webhook` | No (Stripe sig) | Stripe calls this to confirm payment |
| POST | `/mpesa/initiate` | Optional | Sends STK Push to donor's phone |
| POST | `/mpesa/callback` | No (Safaricom) | Safaricom calls this after payment |
| GET | `/mpesa/status/:checkoutId` | No | Poll payment status |
| POST | `/paypal/create-order` | Optional | Creates PayPal order; returns approve URL |
| POST | `/paypal/capture-order` | Optional | Captures approved PayPal order |
| POST | `/manual` | Treasurer | Record cash or bank transfer |
| GET | `/donation/:id` | Optional | Check status of any donation |

### Admin `/api/admin`

| Method | Path | Min Role | Description |
|--------|------|----------|-------------|
| GET | `/users` | Secretary | All users |
| PUT | `/users/:id/approve` | Secretary | Approve pending user; sends welcome email |
| PUT | `/users/:id/role` | Chairman | Change user role |
| PUT | `/users/:id/suspend` | Chairman | Deactivate user |
| GET | `/volunteers` | Secretary | Volunteer applications |
| PUT | `/volunteers/:id/approve` | Secretary | Approve volunteer |
| GET | `/campaigns` | Treasurer | All campaigns |
| POST | `/campaigns` | Chairman | Create campaign |
| PUT | `/campaigns/:id` | Chairman | Update campaign |
| DELETE | `/campaigns/:id` | Chairman | Delete campaign |
| GET | `/events` | Secretary | All events |
| POST | `/events` | Secretary | Create event |
| PUT | `/events/:id` | Secretary | Update event |
| DELETE | `/events/:id` | Secretary | Delete event |
| GET | `/projects` | Secretary | All projects |
| POST | `/projects` | Chairman | Create project |
| PUT | `/projects/:id` | Chairman | Update project |
| DELETE | `/projects/:id` | Chairman | Delete project |
| GET | `/announcements` | Secretary | All announcements |
| POST | `/announcements` | Secretary | Post announcement |
| PUT | `/announcements/:id` | Secretary | Edit announcement |
| DELETE | `/announcements/:id` | Secretary | Delete announcement |
| GET | `/reports/financial` | Treasurer | Aggregated financial summary |
| GET | `/reports/donations` | Treasurer | Paginated donation list |
| GET | `/audit-logs` | Chairman | System activity audit trail |
| GET | `/backup/config` | Chairman | Current backup settings |
| PUT | `/backup/config` | Chairman | Save and apply backup settings |
| POST | `/backup/run` | Chairman | Trigger immediate backup |
| GET | `/backup/list` | Chairman | Backup history |
| POST | `/backup/restore` | Chairman | Restore from a backup |

---

## 10. Authentication and Roles

### Role hierarchy

```
member (1) < volunteer (2) < secretary (3) < treasurer (4) < chairman (5)
```

Each role can do everything the roles below it can do.

### Registration and approval flow

```
1. User submits registration form on login.html
2. System sends verification email with link
3. User clicks link → email is verified
4. Account stays inactive (pending) until a secretary or chairman approves it
5. Chairman/secretary approves user in portal → Users page → Approve button
6. System sends welcome email to user with login link
7. User can now sign in
```

### JWT token

After login, the token is stored in `localStorage.toh_token`. It contains:
- `id` — MongoDB ObjectId of the user
- `role` — the user's current role string
- Expiry of 8 hours (configurable via `JWT_EXPIRES_IN`)

The `authenticate` middleware in `middleware/auth.js` verifies the token on every protected request and re-fetches the user from the database (to catch suspensions and role changes in real time).

---

## 11. Backup System

### How backups work

The system uses `mongodump` to create `.archive.gz` compressed snapshots of the entire MongoDB database.

- **Automatic backups** run on the cron schedule configured in the portal (hourly / daily / weekly / monthly)
- **Manual backups** can be triggered any time from the Backup & Restore page in the chairman portal
- **Restore** automatically creates a safety snapshot of the current state, then runs `mongorestore --drop`

### Cloud backup providers

**Google Cloud Storage:**
```bash
# Install gcloud CLI: https://cloud.google.com/sdk/docs/install
gcloud auth application-default login
gcloud config set project YOUR_GCP_PROJECT_ID
# Create bucket: gcloud storage buckets create gs://toh-backups-2025
```

**AWS S3:**
```bash
# Install AWS CLI: https://aws.amazon.com/cli/
aws configure
# Prompts for: Access Key ID, Secret Access Key, Region, Output format
# Create bucket: aws s3 mb s3://toh-backups-2025
```

**Azure Blob Storage:**
```bash
az login
az storage container create --name backups --account-name YOUR_ACCOUNT
```

Set `CLOUD_PROVIDER` and `CLOUD_BUCKET` in `.env` accordingly.

### Install mongodump and mongorestore

These come with the MongoDB Database Tools package, separate from the server:

```bash
# Ubuntu/Debian:
sudo apt-get install mongodb-database-tools

# macOS with Homebrew:
brew install mongodb-database-tools

# Windows: download installer from
# https://www.mongodb.com/try/download/database-tools
```

---

## 12. Deployment (Production)

### Option A — VPS (DigitalOcean, Hetzner, Linode)

**1. Create Ubuntu 22.04 server (minimum 1 GB RAM)**

**2. Install Node.js 18:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Install MongoDB 7:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

**4. Upload your files:**
```bash
# From your local machine:
rsync -avz backend/ root@YOUR_SERVER:/var/www/toh/backend/
rsync -avz frontend/ root@YOUR_SERVER:/var/www/toh/frontend/
```

**5. Set up backend:**
```bash
ssh root@YOUR_SERVER
cd /var/www/toh/backend
npm install --production
cp .env.example .env
nano .env  # fill in all production values
node utils/seed.js
```

**6. Install PM2 (process manager — keeps the server running):**
```bash
npm install -g pm2
pm2 start server.js --name toh-api
pm2 save
pm2 startup  # follow the printed instructions to enable on reboot
```

**7. Install and configure Nginx:**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/toh
```

Paste this configuration:
```nginx
# API server
server {
    listen 80;
    server_name api.touchofhope.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend website
server {
    listen 80;
    server_name touchofhope.org www.touchofhope.org;
    root /var/www/toh/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/toh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**8. Enable HTTPS with Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx \
  -d touchofhope.org \
  -d www.touchofhope.org \
  -d api.touchofhope.org
# Certbot auto-renews certificates
```

**9. Update frontend API URL:**
```javascript
// frontend/config.js — change line 6:
const API = 'https://api.touchofhope.org/api';
```

**10. Update .env for production:**
```env
NODE_ENV=production
FRONTEND_URL=https://www.touchofhope.org
API_BASE_URL=https://api.touchofhope.org
```

### Option B — Railway or Render (Zero-config cloud)

1. Push backend code to GitHub (separate repo or subfolder)
2. Connect repository to Railway (https://railway.app) or Render (https://render.com)
3. Add a MongoDB plugin or connect MongoDB Atlas
4. Set all environment variables in the platform dashboard
5. Platform builds and deploys automatically on every push

For the frontend, deploy to Netlify or Vercel:
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir .
```

---

## 13. GitHub Setup and Push

### Initial setup

```bash
# Navigate to project root
cd touch-of-hope

# Initialize git
git init

# Create .gitignore first to avoid committing secrets
cat > .gitignore << 'EOF'
# NEVER commit these
backend/.env
backend/backups/

# Dependencies
node_modules/
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
*.log

# IDE
.vscode/
.idea/
EOF

# Stage all files
git add .

# Verify .env is NOT in the list:
git status | grep env
# Should show nothing. If you see backend/.env, check your .gitignore.

# First commit
git commit -m "Initial commit: Touch of Hope CBO MERN system v2.0"

# Create repository on GitHub at https://github.com/new
# Name: touch-of-hope  |  Set to Private if preferred

# Connect and push
git remote add origin https://github.com/YOUR_USERNAME/touch-of-hope.git
git branch -M main
git push -u origin main
```

### Ongoing development workflow

```bash
git add .
git commit -m "Brief description of change"
git push
```

### What to keep private vs public

| File/Folder | Commit? | Reason |
|-------------|:-------:|--------|
| `backend/.env` | NO | Contains secrets |
| `backend/.env.example` | YES | Safe template |
| `backend/backups/` | NO | Database dumps |
| `node_modules/` | NO | Reinstalled via npm install |
| All other code | YES | |

---

## 14. Troubleshooting

### MongoDB connection fails

```bash
# Check if MongoDB is running:
sudo systemctl status mongod

# Start it:
sudo systemctl start mongod

# View recent logs:
sudo journalctl -u mongod -n 30 --no-pager
```

### CORS error in browser console

The error message will be: `Access to fetch at 'http://localhost:5000...' from origin 'http://localhost:5500' has been blocked by CORS policy`

Fix: make sure `FRONTEND_URL` in `.env` exactly matches the browser URL including protocol and port:
```env
# If browser shows http://localhost:5500
FRONTEND_URL=http://localhost:5500

# If using VS Code Live Server on 127.0.0.1:
FRONTEND_URL=http://127.0.0.1:5500
```
Restart the backend after changing `.env`.

### Stripe webhook: signature verification failed

```bash
# Make sure the CLI is forwarding:
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook

# The STRIPE_WEBHOOK_SECRET must be the "whsec_..." value printed by the CLI,
# NOT from the Stripe Dashboard (those are different secrets).
# Copy the value and update .env, then restart the backend.
```

### M-Pesa: callback not received

- The callback URL must be publicly reachable. Use ngrok for local dev
- Set `API_BASE_URL` to the ngrok HTTPS URL (not HTTP)
- Restart the backend after changing `API_BASE_URL`
- Verify the ngrok tunnel is still running (tunnels expire after a few hours on free plan)

### Emails not sending

```bash
cd backend
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');
nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}).verify().then(() => console.log('SMTP OK')).catch(e => console.error('SMTP FAILED:', e.message));
"
```

Common fix: for Gmail, make sure you are using an App Password (not your regular Gmail password), and that 2FA is enabled on the account.

### Port 5000 already in use

```bash
# Find the process:
lsof -i :5000          # macOS and Linux
netstat -ano | findstr :5000  # Windows

# Kill it:
kill -9 <PID>          # macOS and Linux
taskkill /PID <PID> /F  # Windows
```

### Reset the database completely

```bash
mongosh touch_of_hope --eval "db.dropDatabase()"
# Then re-seed:
node utils/seed.js
```

### API returns 403 Forbidden

The user's role is insufficient for the requested endpoint. Check the role requirements in Section 9. Roles can be changed by the chairman in the Users management page.

### JWT token expired

Tokens expire after 8 hours. The user needs to log in again. To extend the session duration, change `JWT_EXPIRES_IN` in `.env` (e.g., `24h` or `7d`).

---

*Touch of Hope CBO · Nairobi, Kenya · Built with care for community impact*
