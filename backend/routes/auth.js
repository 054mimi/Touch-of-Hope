const express  = require('express');
const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const { AuditLog } = require('../models/index');
const email    = require('../utils/email');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

// ── POST /api/auth/register ───────────────────────────────────────
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('phone').notEmpty().withMessage('Phone is required'),
  validate,
  async (req, res) => {
    const { name, email: emailAddr, password, phone, nationalId } = req.body;
    try {
      const existing = await User.findOne({ email: emailAddr });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const verifyToken   = crypto.randomBytes(32).toString('hex');
      const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create({
        name, email: emailAddr, passwordHash: password,
        phone, nationalId,
        emailVerifyToken: verifyToken, emailVerifyExpires: verifyExpires,
      });

      // Send verification email
      const verifyLink = `${process.env.API_BASE_URL}/api/auth/verify-email/${verifyToken}`;
      await email.send(emailAddr, 'verifyEmail', name, verifyLink);

      // Notify chairman
      const chairman = await User.findOne({ role: 'chairman', isActive: true });
      if (chairman) await email.send(chairman.email, 'newMemberNotify', chairman.name, name, emailAddr);

      res.status(201).json({ message: 'Registration submitted. Check your email to verify your address. Your account will be activated by the Chairperson.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ── GET /api/auth/verify-email/:token ────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerifyToken:   req.params.token,
      emailVerifyExpires: { $gt: new Date() },
    });
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login.html?error=invalid_token`);

    user.emailVerified      = true;
    user.emailVerifyToken   = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/login.html?verified=1`);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res) => {
    const { email: emailAddr, password } = req.body;
    try {
      const user = await User.findOne({ email: emailAddr });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      if (!user.emailVerified) return res.status(403).json({ error: 'Please verify your email first. Check your inbox.' });
      if (!user.isActive)      return res.status(403).json({ error: 'Account pending Chairperson approval.' });

      await AuditLog.create({ user: user._id, action: 'LOGIN', ipAddress: req.ip });

      const token = signToken(user);
      res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, membershipNo: user.membershipNo } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ── POST /api/auth/forgot-password ───────────────────────────────
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      // Always return 200 to prevent email enumeration
      if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

      const token   = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken   = token;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const link = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;
      await email.send(user.email, 'resetPassword', user.name, link);

      res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ── POST /api/auth/reset-password ────────────────────────────────
router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  validate,
  async (req, res) => {
    try {
      const user = await User.findOne({
        resetPasswordToken:   req.body.token,
        resetPasswordExpires: { $gt: new Date() },
      });
      if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

      user.passwordHash         = req.body.password;  // pre-save hook hashes it
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ── POST /api/auth/change-password ───────────────────────────────
router.post('/change-password', authenticate,
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const match = await user.comparePassword(req.body.oldPassword);
      if (!match) return res.status(401).json({ error: 'Current password incorrect' });

      user.passwordHash = req.body.newPassword;
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json(req.user.toSafeObject ? req.user.toSafeObject() : req.user);
});

module.exports = router;
