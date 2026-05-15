const express      = require('express');
const User         = require('../models/User');
const Campaign     = require('../models/Campaign');
const Donation     = require('../models/Donation');
const { Event, Project, Announcement } = require('../models/index');

const router = express.Router();

// GET /api/public/overview — public site data
router.get('/overview', async (req, res) => {
  try {
    const [memberCount, volunteerCount, campaignCount, totalRaisedAgg, campaigns, events, projects, announcements] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ 'volunteerProfile.status': 'approved' }),
      Campaign.countDocuments({ status: 'active' }),
      Donation.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Campaign.find({ status: 'active' }).sort('-createdAt').limit(6).select('title description targetAmount amountRaised endDate status'),
      Event.find({ eventDate: { $gte: new Date() }, status: { $ne: 'cancelled' } }).sort('eventDate').limit(6),
      Project.find({ status: 'active' }).sort('-createdAt').limit(6),
      Announcement.find({ isPublic: true }).sort('-createdAt').limit(5).populate('postedBy', 'name role'),
    ]);

    res.json({
      stats: {
        memberCount,
        volunteerCount,
        activecampaigns: campaignCount,
        totalRaised: totalRaisedAgg[0]?.total || 0,
      },
      campaigns,
      events,
      projects,
      announcements,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/public/campaigns — all active campaigns
router.get('/campaigns', async (req, res) => {
  const campaigns = await Campaign.find({ status: 'active' }).sort('-createdAt');
  res.json(campaigns);
});

// GET /api/public/campaign/:id — single campaign detail
router.get('/campaign/:id', async (req, res) => {
  try {
    const c = await Campaign.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Campaign not found' });
    res.json(c);
  } catch { res.status(404).json({ error: 'Not found' }); }
});

module.exports = router;
