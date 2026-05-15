require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const { BackupConfig } = require('../models/index');
const connectDB = require('../config/db');

(async () => {
  await connectDB();

  // Default chairman
  const existing = await User.findOne({ email: 'chairman@touchofhope.org' });
  if (!existing) {
    await User.create({
      name:         'Agnes Akinyi',
      email:        'chairman@touchofhope.org',
      passwordHash: 'Chairman@2025',   // pre-save hook will hash this
      phone:        '+254712345678',
      role:         'chairman',
      isActive:     true,
      emailVerified: true,
      joinedDate:   new Date('2022-03-10'),
    });
    console.log('✅ Default chairman created: chairman@touchofhope.org / Chairman@2025');
    console.log('   ⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN');
  } else {
    console.log('ℹ️  Chairman account already exists');
  }

  // Default backup config
  const cfg = await BackupConfig.findOne({ singleton: 'config' });
  if (!cfg) {
    await BackupConfig.create({ singleton: 'config' });
    console.log('✅ Default backup config created');
  }

  await mongoose.disconnect();
  console.log('✅ Seed complete');
})();
