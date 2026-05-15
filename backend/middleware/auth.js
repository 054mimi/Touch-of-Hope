const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const ROLE_RANK = { member: 1, volunteer: 2, secretary: 3, treasurer: 4, chairman: 5 };

// Verify JWT and attach user to req
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -emailVerifyToken -resetPasswordToken');
    if (!user)          return res.status(401).json({ error: 'User not found' });
    if (!user.isActive) return res.status(403).json({ error: 'Account pending approval' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Require minimum role
const requireRole = (minRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const userRank = ROLE_RANK[req.user.role] || 0;
  const minRank  = ROLE_RANK[minRole]       || 99;
  if (userRank < minRank) return res.status(403).json({ error: `Requires ${minRole} role or higher` });
  next();
};

// Optional auth — attaches user if token present, never blocks
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
  } catch (_) {}
  next();
};

module.exports = { authenticate, requireRole, optionalAuth };
