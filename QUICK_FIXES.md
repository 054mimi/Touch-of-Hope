# Quick Copy-Paste Fixes

Use this file to quickly implement the remaining security fixes.

---

## Fix 1: Add MongoDB Sanitization (2 minutes)

### Step 1: Install package
```bash
cd backend
npm install mongoose-sanitize
```

### Step 2: Add to server.js

Find this section in `backend/server.js` (around line 45):
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

Add this right after:
```javascript
const mongoSanitize = require('mongoose-sanitize');
app.use(mongoSanitize()); // Prevent NoSQL injection
```

**Done!** This prevents attacks like `{"$ne": null}` in user input.

---

## Fix 2: Add Audit Logging for Admin Actions (15 minutes)

### Step 1: Create logger utility

Create file: `backend/utils/auditLog.js`

```javascript
const { AuditLog } = require('../models');

/**
 * Log an admin action
 * @param {ObjectId} userId - User performing the action
 * @param {string} action - Action name (e.g., 'APPROVE_USER')
 * @param {ObjectId} targetId - ID of affected resource
 * @param {object} changes - What changed
 * @param {string} ipAddress - Request IP
 */
async function logAdminAction(userId, action, targetId, changes = {}, ipAddress = null) {
  try {
    await AuditLog.create({
      user: userId,
      action: `ADMIN_${action}`,
      target: targetId,
      changes,
      ipAddress: ipAddress || 'unknown',
    });
  } catch (e) {
    console.error('[Audit Log]', e.message);
  }
}

module.exports = { logAdminAction };
```

### Step 2: Use in admin routes

Example: Update user approval in `backend/routes/admin.js`

Find this endpoint:
```javascript
router.put('/users/:id/approve', authenticate, requireRole('secretary'), async (req, res) => {
  // ... existing approval logic ...
});
```

Add logging at the end of the success block:

```javascript
const { logAdminAction } = require('../utils/auditLog');

router.put('/users/:id/approve', authenticate, requireRole('secretary'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isActive: true,
    }, { new: true });
    
    if (user) {
      // ADD THIS LINE:
      await logAdminAction(req.user._id, 'APPROVE_USER', user._id, { approved: true }, req.ip);
      
      await email.send(user.email, 'welcomeApproved', user.name);
      res.json({ message: 'User approved', user });
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

**Repeat for other admin actions:**
- Change user role
- Suspend user
- Delete campaign
- Restore backup
- Change backup settings

---

## Fix 3: Add Winston Logger (20 minutes)

### Step 1: Install Winston
```bash
npm install winston
```

### Step 2: Create logger utility

Create file: `backend/utils/logger.js`

```javascript
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      // Hide sensitive data
      const sanitized = JSON.stringify(metadata)
        .replace(/"password[^,}]*/g, '"password":"***"')
        .replace(/"token[^,}]*/g, '"token":"***"')
        .replace(/"secret[^,}]*/g, '"secret":"***"');
      
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${sanitized !== '{}' ? sanitized : ''}`;
    })
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// In development, also log to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

module.exports = logger;
```

### Step 3: Use throughout app

Replace `console.error()` with `logger.error()`:

```javascript
// Before:
console.error('[Stripe]', e.message);

// After:
const logger = require('../utils/logger');
logger.error('Stripe payment failed', { error: e.message, donationId: donation._id });
```

**Key places to update:**
- All catch blocks in routes
- Payment processing errors
- Database connection errors
- Authentication failures

---

## Fix 4: Add Database Connection Retries (10 minutes)

### Replace `backend/config/db.js`

**Before:**
```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed`);
    process.exit(1);
  }
};
```

**After (with retries):**
```javascript
const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 1000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️  MongoDB connection failed. Retrying in ${delay}ms (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay * 1.5); // Exponential backoff
    }
    console.error(`❌ MongoDB connection failed after all retries: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

module.exports = connectDB;
```

---

## Fix 5: Add Redis for Rate Limiting (15 minutes)

### Step 1: Install Redis and store
```bash
npm install redis rate-limit-redis
```

### Step 2: Update server.js

Find the rate limiting section (around line 50):

**Before:**
```javascript
app.use('/api/auth/login',    rateLimit({ windowMs: 15 * 60 * 1000, max: 10, ... }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, ... }));
```

**After (with Redis):**
```javascript
const { createClient } = require('redis');
const RedisStore = require('rate-limit-redis');

// Create Redis client
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch(err => console.warn('⚠️  Redis connection failed, using memory store:', err.message));

const createLimiter = (windowMs, max, name) => {
  return rateLimit({
    store: process.env.NODE_ENV === 'production' 
      ? new RedisStore({ client: redisClient, prefix: `rl:${name}:` })
      : undefined,
    windowMs,
    max,
    skip: (req) => process.env.NODE_ENV !== 'production',
    keyGenerator: (req) => req.ip,
    message: `Too many requests from this IP, please try again after ${Math.ceil(windowMs / 60000)} minute(s).`,
  });
};

app.use('/api/auth/login',    createLimiter(15 * 60 * 1000, 10, 'login'));
app.use('/api/auth/register', createLimiter(60 * 60 * 1000, 5, 'register'));
app.use('/api/',              createLimiter(60 * 1000, 120, 'api'));
```

Add to `.env`:
```env
REDIS_URL=redis://localhost:6379
```

---

## Fix 6: Email Template Testing (5 minutes)

Test that emails are being sent. Add to `backend/utils/email.js` at the top:

```javascript
// Quick test function
async function testEmailSetup() {
  try {
    const transporter = nodemailer.createTransport({...});
    const verified = await transporter.verify();
    if (verified) {
      console.log('✅ Email service verified and ready');
    }
  } catch (e) {
    console.error('❌ Email service error:', e.message);
  }
}

// Call this on app startup:
if (process.env.NODE_ENV === 'development') {
  testEmailSetup();
}
```

---

## Testing After Each Fix

```bash
# After each change:
npm run dev

# Check for errors in terminal output
# If you see "✅" messages, you're good!
```

---

## All Done When You See:

```
✅ MongoDB connected: cluster0.abc12.mongodb.net
✅ Email service verified and ready
🚀 Touch of Hope API running on http://localhost:5000
   Env:      development
   MongoDB:  cluster0.abc12.mongodb.net
   Frontend: http://localhost:5500
```

---

That's it! Each fix takes 2-20 minutes. Do them in this order, testing after each one.
