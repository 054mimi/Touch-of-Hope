const express  = require('express');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const { Event, Project, Announcement, AuditLog, BackupConfig, BackupHistory } = require('../models/index');
const email    = require('../utils/email');
const { authenticate, requireRole } = require('../middleware/auth');
const cron     = require('node-cron');
const { execSync } = require('child_process');
const fs       = require('fs');
const path     = require('path');

const router = express.Router();
router.use(authenticate);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// ── USERS ─────────────────────────────────────────────────────────
router.get('/users', requireRole('secretary'), async (req, res) => {
  const users = await User.find().select('-passwordHash -emailVerifyToken -resetPasswordToken').sort('-createdAt');
  res.json(users);
});

router.put('/users/:id/approve', requireRole('secretary'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await email.send(user.email, 'welcomeApproved', user.name, user.role);
    await AuditLog.create({ user: req.user._id, action: 'APPROVE_USER', details: `Approved ${user.email}`, ipAddress: req.ip });
    res.json({ message: 'User approved and notified by email' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/users/:id/role', requireRole('chairman'),
  body('role').isIn(['member','volunteer','secretary','treasurer','chairman']),
  validate,
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
      await AuditLog.create({ user: req.user._id, action: 'CHANGE_ROLE', details: `${user.email} → ${req.body.role}` });
      res.json({ message: 'Role updated' });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  }
);

router.put('/users/:id/suspend', requireRole('chairman'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  await AuditLog.create({ user: req.user._id, action: 'SUSPEND_USER', details: `Suspended user ${req.params.id}` });
  res.json({ message: 'User suspended' });
});

// ── VOLUNTEERS ────────────────────────────────────────────────────
router.get('/volunteers', requireRole('secretary'), async (req, res) => {
  const vols = await User.find({ 'volunteerProfile.status': { $in: ['pending','approved'] } })
    .select('name email phone volunteerProfile createdAt');
  res.json(vols);
});

router.put('/volunteers/:id/approve', requireRole('secretary'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    role: 'volunteer',
    'volunteerProfile.status': 'approved',
    'volunteerProfile.approvedBy': req.user._id,
    'volunteerProfile.approvedAt': new Date(),
  });
  res.json({ message: 'Volunteer approved' });
});

// ── CAMPAIGNS ─────────────────────────────────────────────────────
router.get('/campaigns', requireRole('treasurer'), async (req, res) => {
  const campaigns = await Campaign.find().sort('-createdAt').populate('createdBy', 'name');
  res.json(campaigns);
});

router.post('/campaigns', requireRole('chairman'),
  body('title').trim().notEmpty(),
  body('targetAmount').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const c = await Campaign.create({ ...req.body, createdBy: req.user._id });
      res.status(201).json({ message: 'Campaign created', id: c._id });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  }
);

router.put('/campaigns/:id', requireRole('chairman'), async (req, res) => {
  try {
    const allowed = ['title','description','targetAmount','endDate','status'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await Campaign.findByIdAndUpdate(req.params.id, updates);
    res.json({ message: 'Campaign updated' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/campaigns/:id', requireRole('chairman'), async (req, res) => {
  await Campaign.findByIdAndDelete(req.params.id);
  res.json({ message: 'Campaign deleted' });
});

// ── EVENTS ────────────────────────────────────────────────────────
router.get('/events', requireRole('secretary'), async (req, res) => {
  const events = await Event.find().sort('-eventDate').populate('createdBy', 'name');
  res.json(events);
});

router.post('/events', requireRole('secretary'),
  body('title').trim().notEmpty(),
  body('eventDate').isISO8601(),
  validate,
  async (req, res) => {
    try {
      const e = await Event.create({ ...req.body, createdBy: req.user._id });
      res.status(201).json({ message: 'Event created', id: e._id });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
  }
);

router.put('/events/:id', requireRole('secretary'), async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Event updated' });
});

router.delete('/events/:id', requireRole('secretary'), async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted' });
});

// ── PROJECTS ──────────────────────────────────────────────────────
router.get('/projects', requireRole('secretary'), async (req, res) => {
  const projects = await Project.find().sort('-createdAt').populate('createdBy', 'name');
  res.json(projects);
});

router.post('/projects', requireRole('chairman'),
  body('title').trim().notEmpty(),
  validate,
  async (req, res) => {
    const p = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ message: 'Project created', id: p._id });
  }
);

router.put('/projects/:id', requireRole('chairman'), async (req, res) => {
  await Project.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Project updated' });
});

router.delete('/projects/:id', requireRole('chairman'), async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────
router.get('/announcements', requireRole('secretary'), async (req, res) => {
  const anns = await Announcement.find().sort('-createdAt').populate('postedBy', 'name');
  res.json(anns);
});

router.post('/announcements', requireRole('secretary'),
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  validate,
  async (req, res) => {
    const a = await Announcement.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ message: 'Announcement posted', id: a._id });
  }
);

router.put('/announcements/:id', requireRole('secretary'), async (req, res) => {
  await Announcement.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Updated' });
});

router.delete('/announcements/:id', requireRole('secretary'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── FINANCIAL REPORTS ─────────────────────────────────────────────
router.get('/reports/financial', requireRole('treasurer'), async (req, res) => {
  const { from, to } = req.query;
  const match = { status: 'completed' };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to)   match.createdAt.$lte = new Date(to);
  }
  const [byMethod, byCampaign, monthly, totals] = await Promise.all([
    Donation.aggregate([{ $match: match }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }]),
    Donation.aggregate([{ $match: { ...match, campaign: { $ne: null } } }, { $group: { _id: '$campaign', total: { $sum: '$amount' } } }, { $lookup: { from: 'campaigns', localField: '_id', foreignField: '_id', as: 'campaign' } }]),
    Donation.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } }, { $sort: { _id: -1 } }, { $limit: 12 }]),
    Donation.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 }, avg: { $avg: '$amount' } } }]),
  ]);
  res.json({ byMethod, byCampaign, monthly, summary: totals[0] || { total: 0, count: 0, avg: 0 } });
});

// GET /api/admin/reports/donations — paginated donation list
router.get('/reports/donations', requireRole('treasurer'), async (req, res) => {
  const { page = 1, limit = 50, status, method } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (method) filter.paymentMethod = method;
  const [donations, total] = await Promise.all([
    Donation.find(filter).populate('campaign', 'title').populate('donorUser', 'name email').populate('recordedBy', 'name')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
    Donation.countDocuments(filter),
  ]);
  res.json({ donations, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// ── AUDIT LOGS ────────────────────────────────────────────────────
router.get('/audit-logs', requireRole('chairman'), async (req, res) => {
  const logs = await AuditLog.find().populate('user', 'name email').sort('-createdAt').limit(200);
  res.json(logs);
});

// ══════════════════════════════════════════════════════════════════
//  BACKUP SYSTEM
// ══════════════════════════════════════════════════════════════════
const BACKUP_DIR = process.env.BACKUP_LOCAL_DIR || path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

let backupCronJob = null;

async function runBackup(tag = 'auto') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename  = `toh_backup_${tag}_${timestamp}.archive.gz`;
  const localPath = path.join(BACKUP_DIR, filename);

  const uri = process.env.MONGODB_URI;
  execSync(`mongodump --uri="${uri}" --archive="${localPath}" --gzip`);

  const stats = fs.statSync(localPath);
  const cfg   = await BackupConfig.findOne({ singleton: 'config' });
  let cloudPath = null, cloudStatus = 'skipped';

  if (cfg?.cloudEnabled && cfg.bucketName) {
    try {
      if (cfg.cloudProvider === 'gcs') {
        execSync(`gsutil cp "${localPath}" gs://${cfg.bucketName}/backups/${filename}`);
        cloudPath   = `gs://${cfg.bucketName}/backups/${filename}`;
        cloudStatus = 'uploaded';
      } else if (cfg.cloudProvider === 's3') {
        execSync(`aws s3 cp "${localPath}" s3://${cfg.bucketName}/backups/${filename}`);
        cloudPath   = `s3://${cfg.bucketName}/backups/${filename}`;
        cloudStatus = 'uploaded';
      }
    } catch (e) { cloudStatus = 'failed: ' + e.message; }
  }

  const history = await BackupHistory.create({
    filename, localPath: cfg?.localEnabled ? localPath : null,
    cloudPath, cloudStatus, sizeBytes: stats.size,
    triggeredBy: tag === 'auto' ? 'auto' : 'manual', status: 'success',
  });

  await BackupConfig.findOneAndUpdate({ singleton: 'config' }, { lastRun: new Date() });
  if (cfg?.retentionDays) await pruneOldBackups(cfg.retentionDays);

  return { message: 'Backup complete', filename, sizeBytes: stats.size, id: history._id };
}

async function pruneOldBackups(days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const old = fs.readdirSync(BACKUP_DIR).filter(f => {
    const fp = path.join(BACKUP_DIR, f);
    return fs.statSync(fp).mtime < cutoff;
  });
  old.forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
}

function scheduleBackup(cfg) {
  if (backupCronJob) { backupCronJob.stop(); backupCronJob = null; }
  const [h, m] = (cfg.backupTime || '02:00').split(':');
  const expr = { hourly: '0 * * * *', daily: `${m} ${h} * * *`, weekly: `${m} ${h} * * 0`, monthly: `${m} ${h} 1 * *` }[cfg.frequency] || `${m} ${h} * * *`;
  backupCronJob = cron.schedule(expr, async () => {
    console.log(`[CRON] Running ${cfg.frequency} backup`);
    try { await runBackup('auto'); } catch (e) { console.error('[CRON backup]', e.message); }
  });
}

// Load schedule on module load
(async () => {
  const cfg = await BackupConfig.findOne({ singleton: 'config' });
  if (cfg) scheduleBackup(cfg);
})();

router.get('/backup/config', requireRole('chairman'), async (req, res) => {
  const cfg = await BackupConfig.findOne({ singleton: 'config' });
  res.json(cfg || {});
});

router.put('/backup/config', requireRole('chairman'),
  body('frequency').isIn(['hourly','daily','weekly','monthly']),
  validate,
  async (req, res) => {
    const cfg = await BackupConfig.findOneAndUpdate(
      { singleton: 'config' },
      { $set: req.body },
      { upsert: true, new: true }
    );
    scheduleBackup(cfg);
    res.json({ message: 'Backup config saved' });
  }
);

router.post('/backup/run', requireRole('chairman'), async (req, res) => {
  try {
    const result = await runBackup('manual');
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/backup/list', requireRole('chairman'), async (req, res) => {
  const history = await BackupHistory.find().sort('-createdAt').limit(50);
  res.json(history);
});

router.post('/backup/restore', requireRole('chairman'),
  body('backupId').notEmpty(),
  validate,
  async (req, res) => {
    try {
      const rec = await BackupHistory.findById(req.body.backupId);
      if (!rec) return res.status(404).json({ error: 'Backup not found' });

      let filePath = rec.localPath;
      if (!filePath || !fs.existsSync(filePath)) {
        if (rec.cloudPath) {
          const dest = path.join(BACKUP_DIR, `restore_${rec.filename}`);
          if (rec.cloudPath.startsWith('gs://')) execSync(`gsutil cp "${rec.cloudPath}" "${dest}"`);
          else if (rec.cloudPath.startsWith('s3://')) execSync(`aws s3 cp "${rec.cloudPath}" "${dest}"`);
          filePath = dest;
        } else {
          return res.status(404).json({ error: 'Backup file not available' });
        }
      }

      // Safety snapshot before restore
      await runBackup('pre-restore');

      const uri = process.env.MONGODB_URI;
      execSync(`mongorestore --uri="${uri}" --archive="${filePath}" --gzip --drop`);

      await AuditLog.create({ user: req.user._id, action: 'DB_RESTORE', details: `Restored from ${rec.filename}` });
      res.json({ message: 'Database restored successfully', from: rec.filename });
    } catch (e) {
      res.status(500).json({ error: 'Restore failed: ' + e.message });
    }
  }
);

module.exports = router;
