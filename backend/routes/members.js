const express  = require('express');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const Donation = require('../models/Donation');
const { Event } = require('../models/index');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/members/me
router.get('/me', async (req, res) => {
  try {
    const donations = await Donation.find({ donorUser: req.user._id })
      .populate('campaign', 'title')
      .sort('-createdAt')
      .limit(20);

    const events = await Event.find({ registeredVolunteers: req.user._id }).sort('eventDate');

    res.json({ profile: req.user, donations, events });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/members/me
router.put('/me',
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const { name, phone } = req.body;
      const updates = {};
      if (name)  updates.name  = name;
      if (phone) updates.phone = phone;
      await User.findByIdAndUpdate(req.user._id, updates);
      res.json({ message: 'Profile updated' });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  }
);

// POST /api/members/volunteer-apply
router.post('/volunteer-apply',
  body('skills').notEmpty().withMessage('Skills are required'),
  body('availability').isIn(['weekdays','weekends','full-time','flexible']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      await User.findByIdAndUpdate(req.user._id, {
        'volunteerProfile.skills':       req.body.skills,
        'volunteerProfile.availability': req.body.availability,
        'volunteerProfile.bio':          req.body.bio || '',
        'volunteerProfile.status':       'pending',
      });
      res.json({ message: 'Volunteer application submitted. Pending secretary approval.' });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  }
);

// GET /api/members/volunteer-events/mine
router.get('/volunteer-events/mine', requireRole('volunteer'), async (req, res) => {
  const events = await Event.find({ registeredVolunteers: req.user._id }).sort('eventDate');
  res.json(events);
});

// GET /api/members/volunteer-events/available
router.get('/volunteer-events/available', requireRole('volunteer'), async (req, res) => {
  const events = await Event.find({
    eventDate: { $gte: new Date() },
    registeredVolunteers: { $ne: req.user._id },
    status: 'upcoming',
  }).sort('eventDate');
  res.json(events);
});

// POST /api/members/volunteer-events/:id/join
router.post('/volunteer-events/:id/join', requireRole('volunteer'), async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $addToSet: { registeredVolunteers: req.user._id },
    });
    res.json({ message: 'Joined event successfully' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
