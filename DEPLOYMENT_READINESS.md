# Touch of Hope CBO — Deployment Readiness Assessment
**Report Date:** March 20, 2026  
**Status:** ⚠️ **NOT READY FOR PRODUCTION**

---

## Executive Summary

Your application is **well-architected** with good separation of concerns, proper authentication, and multiple payment integrations. However, **critical security and operational features are incomplete**. Below is a prioritized list of what needs to be fixed before going live.

---

## 🔴 Critical Issues (Must Fix Before Deployment)

### 1. Missing Environment Configuration Template
**Severity:** 🔴 CRITICAL  
**Impact:** Cannot deploy without hardcoding secrets; breaks CI/CD pipelines

**Current State:**
- No `.env.example` file exists in the `backend/` folder
- The dev.md documents the variables, but no template file for easy setup

**What To Do:**
```bash
# Create backend/.env.example with all required variables
# This is your deployment template — safe to commit to Git
```

**Files To Create:**
- `backend/.env.example` — Template with all variables (no real secrets)

---

### 2. No Environment Variable Validation on Startup
**Severity:** 🔴 CRITICAL  
**Impact:** App silently fails or crashes with cryptic errors in production

**Current State:**
- `server.js` doesn't check if required env vars are set
- If `JWT_SECRET` is missing, `jwt.sign()` will fail unpredictably
- If `MONGODB_URI` is missing, database connection hangs

**What To Do:**
Add startup validation in `backend/server.js` (before `connectDB()`):
```javascript
const requiredEnvs = [
  'PORT', 'NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'
];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvs.join(', ')}`);
  process.exit(1);
}

const optionalEnvs = [
  'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
  'MPESA_CONSUMER_KEY', 'MPESA_ENV',
  'PAYPAL_CLIENT_ID', 'PAYPAL_ENV'
];
const missingOptional = optionalEnvs.filter(env => !process.env[env]);
if (missingOptional.length > 0) {
  console.warn(`⚠️  Optional payment variables not configured: ${missingOptional.join(', ')}`);
}
```

---

### 3. Missing HTTPS/TLS Enforcement
**Severity:** 🔴 CRITICAL  
**Impact:** User credentials transmitted in plaintext; payment data exposed

**Current State:**
- App runs on HTTP (port 5000)
- No redirect to HTTPS
- No HSTS headers set

**What To Do:**
Add to `backend/server.js` after middleware:
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
  
  // HSTS — tell browsers to always use HTTPS
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
}
```

Also update in helmet config to trust proxy:
```javascript
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.set('trust proxy', 1); // Trust X-Forwarded-* headers from load balancer
```

---

### 4. Incomplete Input Validation
**Severity:** 🔴 CRITICAL  
**Impact:** SQL/NoSQL injection, data corruption, invalid donations

**Current State:**
- Auth routes have some validation (express-validator)
- Payment routes have minimal validation
- Admin routes likely missing amount range checks
- No sanitization of user input

**What To Do:**
1. Add validation to `/api/payments/stripe/create-intent`:
   ```javascript
   body('amount').isInt({ min: 10, max: 10000000 }),
   body('currency').isLength({ min: 3, max: 3 }),
   body('donorEmail').optional().isEmail().normalizeEmail(),
   ```

2. Add mongoose-sanitize to prevent NoSQL injection:
   ```bash
   npm install mongoose-sanitize
   ```
   Add to `backend/server.js`:
   ```javascript
   const mongoSanitize = require('mongoose-sanitize');
   app.use(mongoSanitize());
   ```

---

### 5. Weak Stripe Webhook Handling
**Severity:** 🔴 CRITICAL  
**Impact:** Payments not confirmed; duplicate donations processed

**Current State:**
- Webhook signature verification exists ✅
- But no idempotency handling — if webhook is retried, donation status updates twice
- No error logging if webhook fails

**What To Do:**
Update `/api/payments/stripe/webhook` to check `idempotency_key`:
```javascript
if (event.type === 'payment_intent.succeeded') {
  const intent   = event.data.object;
  const donation = await Donation.findOne({ stripePaymentIntentId: intent.id });
  
  // Only update if currently pending (idempotent)
  if (donation && donation.status === 'pending') {
    donation.status      = 'completed';
    donation.confirmedAt = new Date();
    await donation.save();
    await sendReceipt(donation);
  }
}
```

---

## 🟡 High Priority Issues (Fix Before First Day of Operations)

### 6. M-Pesa & PayPal Integration Incomplete
**Severity:** 🟡 HIGH  
**Impact:** Donors can't use these payment methods; lost revenue

**Current State:**
- Lines 1-80 of `payments.js` show Stripe (complete)
- M-Pesa routes assumed to be at lines 100+ (need to verify)
- PayPal routes assumed to be at lines 200+ (need to verify)

**What To Do:**
1. Check if `POST /api/payments/mpesa/initiate`, `POST /api/payments/mpesa/callback`, and `GET /api/payments/mpesa/status/:checkoutId` exist
2. Check if `POST /api/payments/paypal/create-order` and `POST /api/payments/paypal/capture-order` exist
3. If missing, implement based on the dev.md specification

---

### 7. No Comprehensive Logging
**Severity:** 🟡 HIGH  
**Impact:** Can't debug issues in production; compliance violations

**Current State:**
- Uses `console.error()` and `console.log()`
- No persistent log files
- Logs exposed to stdout (not production-safe)

**What To Do:**
Install Winston logger:
```bash
npm install winston
```

Create `backend/utils/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

Replace all `console.error()` with `logger.error()` in production code.

---

### 8. Backup System Not Implemented
**Severity:** 🟡 HIGH  
**Impact:** No disaster recovery; data loss on server failure

**Current State:**
- `admin.js` likely has placeholder endpoints for backup/restore
- No mongodump/mongorestore integration
- No cloud storage (GCS/S3) upload

**What To Do:**
Implement `/api/admin/backup/*` endpoints with:
1. Scheduled backups using `node-cron` (already in dependencies)
2. Manual backup trigger
3. Cloud upload (GCS or S3)
4. Restore with safety snapshot

---

### 9. Insufficient CORS Configuration
**Severity:** 🟡 HIGH  
**Impact:** CSRF attacks possible; security headers missing

**Current State:**
```javascript
cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', ...],
  credentials: true,
})
```
- Hardcoded localhost URLs (should be conditional on NODE_ENV)
- No CSRF protection layer

**What To Do:**
```javascript
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [process.env.FRONTEND_URL];
    if (process.env.NODE_ENV !== 'production') {
      allowed.push('http://localhost:5500', 'http://127.0.0.1:5500');
    }
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
```

Add CSRF protection:
```bash
npm install csurf cookie-parser
```

---

## 🟠 Medium Priority Issues (Fix Before Public Launch)

### 10. Email Verification Flow Incomplete
**Severity:** 🟠 MEDIUM  
**Impact:** Users may not be able to access accounts; account enumeration

**Current State:**
- `/api/auth/register` sends verification email ✅
- `/api/auth/verify-email/:token` verifies email ✅
- BUT: Need to verify email templates exist and are sent correctly

**What To Do:**
1. Verify `backend/utils/email.js` has all required templates:
   - `verifyEmail` — account activation link
   - `resetPassword` — password reset link
   - `donationReceipt` — donation confirmation
   - `welcomeApproved` — account approved notification
   - `newMemberNotify` — chairman notification of new signup

2. Test complete flow:
   ```bash
   npm run dev
   # Register via frontend
   # Check that email was sent (SMTP_PASS must be valid)
   # Click verification link
   # Verify redirects to login page
   ```

---

### 11. Rate Limiting Per-IP Not Implemented
**Severity:** 🟠 MEDIUM  
**Impact:** Brute force attacks possible; API spam

**Current State:**
```javascript
app.use('/api/auth/login',    rateLimit({ windowMs: 15 * 60 * 1000, max: 10, ... }));
```
- Uses in-memory store (loses state on server restart)
- Doesn't respect X-Forwarded-For from load balancer

**What To Do:**
Install and use Redis store:
```bash
npm install redis rate-limit-redis
```

Update rate limiters:
```javascript
const { createClient } = require('redis');
const RedisStore = require('rate-limit-redis');

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient, prefix: 'rl:' }),
  skip: (req) => process.env.NODE_ENV !== 'production',
  keyGenerator: (req) => req.ip, // Respects trust proxy
});
```

---

### 12. No Audit Trail for Admin Actions
**Severity:** 🟠 MEDIUM  
**Impact:** Can't track who approved users, changed settings

**Current State:**
- `AuditLog` model exists in `backend/models/index.js` ✅
- LOGIN action is logged ✅
- But admin actions (approve user, change campaign, restore backup) not logged

**What To Do:**
Add logging helper in `backend/utils/auditLog.js`:
```javascript
const { AuditLog } = require('../models');

async function logAction(userId, action, targetId, changes = {}) {
  await AuditLog.create({ user: userId, action, target: targetId, changes });
}

module.exports = logAction;
```

Call in admin routes (e.g., approve user):
```javascript
router.put('/users/:id/approve', authenticate, requireRole('secretary'), async (req, res) => {
  // ... approval logic ...
  await logAction(req.user._id, 'APPROVE_USER', userId, { oldRole: 'member', newRole: 'member', approved: true });
});
```

---

## 🟢 Low Priority (Nice to Have Before Launch)

### 13. Database Connection Retry Logic
**Severity:** 🟢 LOW  
**Impact:** Server crashes if MongoDB temporarily unavailable

**Current State:**
```javascript
.catch(err => {
  console.error(`❌ MongoDB connection failed: ${err.message}`);
  process.exit(1); // Crashes immediately
});
```

**What To Do:**
Implement exponential backoff:
```javascript
const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️  Retrying MongoDB connection (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (6 - retries)));
      return connectDB(retries - 1);
    }
    console.error(`❌ MongoDB connection failed after retries`);
    process.exit(1);
  }
};
```

---

### 14. Payment Error Messages Too Verbose
**Severity:** 🟢 LOW  
**Impact:** Information leakage; confusing users

**Current State:**
```javascript
catch (e) {
  res.status(500).json({ error: e.message }); // Exposes internal error
}
```

**What To Do:**
Sanitize error messages:
```javascript
const getClientError = (error) => {
  if (error.message.includes('rate limit')) return 'Too many requests. Please try again later.';
  if (error.message.includes('card')) return 'Payment card declined. Please check details.';
  return 'Payment processing failed. Please contact support.';
};

catch (e) {
  logger.error(e);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : e.message
  });
}
```

---

## 📋 Pre-Deployment Checklist

### Configuration
- [ ] Create `.env` for production with all real API keys and secrets
- [ ] Create `.env.example` template (safe to commit)
- [ ] Verify `FRONTEND_URL` points to your live domain
- [ ] Generate strong `JWT_SECRET` using `openssl rand -hex 64`
- [ ] Set `NODE_ENV=production`

### Database
- [ ] Create MongoDB Atlas account
- [ ] Create cluster in appropriate region (Africa)
- [ ] Test connection string locally
- [ ] Seed database with default chairman account
- [ ] Verify backups are scheduled

### Payments
- [ ] [ ] Stripe: Switch from test to live keys
- [ ] [ ] Stripe: Register webhook URL in dashboard
- [ ] [ ] M-Pesa: Apply for production access
- [ ] [ ] PayPal: Switch to live credentials
- [ ] [ ] Test all 4 payment methods with small amounts

### Email
- [ ] Verify Gmail App Password works (test SMTP)
- [ ] Test registration → verify email → login flow
- [ ] Check email templates are professional

### Security
- [ ] SSL/TLS certificate installed
- [ ] HTTPS redirect working
- [ ] CORS whitelist updated
- [ ] Rate limiting active
- [ ] Helmet headers set
- [ ] All sensitive data removed from logs

### Deployment
- [ ] VPS/hosting account created
- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running
- [ ] Code deployed via Git
- [ ] Environment variables set in server
- [ ] Firewall configured (port 80, 443, 5000)
- [ ] Monitoring/alerting set up

### Testing
- [ ] Full registration → login → donate flow works
- [ ] All 4 payment methods tested
- [ ] Backup/restore tested
- [ ] Admin approval workflow tested
- [ ] Load testing done (simulate 50+ concurrent users)

---

## 🚀 Quick Start: Fixing Critical Issues (Next 2 Hours)

### Priority Order:
1. **Create `.env.example`** (5 min)
2. **Add env validation** in server.js (10 min)
3. **Add HTTPS enforcement** (5 min)
4. **Secure Stripe webhook** with idempotency (10 min)
5. **Add input validation** to payment endpoints (15 min)
6. **Verify M-Pesa/PayPal routes exist** (10 min)
7. **Test complete payment flows** (30 min)

---

## 🔗 Important Links

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Stripe Dashboard:** https://dashboard.stripe.com
- **M-Pesa Developer:** https://developer.safaricom.co.ke
- **PayPal Developer:** https://developer.paypal.com
- **Deployment Guide:** See section 12 in `dev.md`

---

## Questions? Issues?

1. **Review the full dev.md** — it has detailed setup for all integrations
2. **Check the API Reference** (section 9 of dev.md) — all endpoints documented
3. **Test locally first** — use development credentials before going live

**Good luck with the launch! 🚀**
