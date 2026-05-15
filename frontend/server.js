require('dotenv').config();
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 8000;

// ── MIME Types for Static Files ──────────────────────────────────
const mimeTypes = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// ── Serve Static Files with Correct MIME Types ───────────────────
app.use((req, res, next) => {
  const ext = path.extname(req.url).toLowerCase();
  if (mimeTypes[ext]) {
    res.type(mimeTypes[ext]);
  }
  next();
});

app.use(express.static(__dirname, {
  index: false,  // Don't auto-serve index.html for /
  maxAge: '1h',  // Cache static files for 1 hour
}));

// ── JSON Body Parser ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Route Handlers (HTML Pages) ──────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

app.get('/portal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

app.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset-password.html'));
});

app.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// ── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  time: new Date(), 
  message: 'Frontend server is running',
  frontend: true
}));

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  // For any other route, try to serve index.html (SPA fallback)
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// ── Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message || 'Internal server error';
  console.error(`[ERROR] ${statusCode}: ${message}`);
  res.status(statusCode).json({ error: message });
});

// ── Listen ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  🌟 Touch of Hope - Frontend Server 🌟        ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Frontend server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📝 Available Pages:');
  console.log(`   🏠 Home:              http://localhost:${PORT}/`);
  console.log(`   🏠 Home (alt):        http://localhost:${PORT}/index.html`);
  console.log(`   🔐 Login:             http://localhost:${PORT}/login.html`);
  console.log(`   📊 Portal:            http://localhost:${PORT}/portal.html`);
  console.log(`   🔄 Forgot Password:   http://localhost:${PORT}/forgot-password.html`);
  console.log('');
  console.log('⚠️  IMPORTANT: Make sure backend is running!');
  console.log('   Backend should be running on http://localhost:5000');
  console.log('');
  console.log('📋 Serving Files:');
  console.log('   CSS Files: ✅');
  console.log('   JS Files: ✅');
  console.log('   Images: ✅');
  console.log('');
  console.log('🔄 Watching for changes with nodemon...');
  console.log('');
});

module.exports = app;
