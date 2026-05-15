require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Environment Validation ────────────────────────────────────────
const requiredEnvs = [
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
];

const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length > 0) {
  console.error(`\n❌ FATAL: Missing required environment variables:\n   ${missingEnvs.join(', ')}\n`);
  console.error('   Copy backend/.env.example to backend/.env and fill in all values.\n');
  process.exit(1);
}

const optionalEnvs = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'MPESA_CONSUMER_KEY',
  'MPESA_ENV',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_ENV',
];
const missingOptional = optionalEnvs.filter(env => !process.env[env]);
if (missingOptional.length > 0) {
  console.warn(`\n⚠️  Optional payment variables not configured: ${missingOptional.join(', ')}`);
  console.warn('   Some payment methods will not be available.\n');
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('\n❌ FATAL: JWT_SECRET must be at least 32 characters long.\n   Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n');
  process.exit(1);
}

// ── Database ──────────────────────────────────────────────────────
connectDB();

// ── Stripe webhook needs raw body — mount BEFORE json middleware ──
const paymentsRouter = require('./routes/payments');
app.post('/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => { req._rawBody = true; next(); },
  paymentsRouter
);

// ── Global Middleware ─────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.set('trust proxy', 1); // Trust X-Forwarded-* from load balancer

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const isSecure = req.header('x-forwarded-proto') === 'https' || req.secure;
    if (!isSecure) {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [process.env.FRONTEND_URL];
    if (process.env.NODE_ENV !== 'production') {
      allowed.push('http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000');
    }
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────────────────
app.use('/api/auth/login',    rateLimit({ windowMs: 15 * 60 * 1000, max: 10,  message: 'Too many login attempts.' }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 5,   message: 'Too many registrations.' }));
app.use('/api/',              rateLimit({ windowMs: 60 * 1000,       max: 120, message: 'Too many requests.' }));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/public',   require('./routes/public'));
app.use('/api/members',  require('./routes/members'));
app.use('/api/payments', paymentsRouter);
app.use('/api/admin',    require('./routes/admin'));

// ── Health ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date(), env: process.env.NODE_ENV }));

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Touch of Hope API running on http://localhost:${PORT}`);
  console.log(`   Env:      ${process.env.NODE_ENV}`);
  console.log(`   MongoDB:  ${process.env.MONGODB_URI?.split('@')[1] || 'localhost'}`);
  console.log(`   Frontend: ${process.env.FRONTEND_URL}\n`);
});

module.exports = app;
