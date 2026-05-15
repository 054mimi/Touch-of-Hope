const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true,
                  match: [/^\S+@\S+\.\S+$/, 'Invalid email address'] },
  passwordHash: { type: String, required: true },
  phone:        { type: String, trim: true },
  nationalId:   { type: String, trim: true },
  role:         { type: String, enum: ['member','volunteer','secretary','treasurer','chairman'], default: 'member' },
  isActive:     { type: Boolean, default: false },   // false = pending approval
  avatarUrl:    { type: String },
  // Email verification
  emailVerified:      { type: Boolean, default: false },
  emailVerifyToken:   { type: String },
  emailVerifyExpires: { type: Date },
  // Password reset
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  // Volunteer sub-doc
  volunteerProfile: {
    skills:       { type: String },
    availability: { type: String, enum: ['weekdays','weekends','full-time','flexible'] },
    bio:          { type: String },
    status:       { type: String, enum: ['none','pending','approved','inactive'], default: 'none' },
    approvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt:   { type: Date },
  },
  membershipNo: { type: String, unique: true, sparse: true },
  joinedDate:   { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerifyToken;
  delete obj.resetPasswordToken;
  return obj;
};

// Auto-generate membership number
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.membershipNo) {
    const count = await mongoose.model('User').countDocuments();
    this.membershipNo = `TOH-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
