const mongoose = require('mongoose');

// ── Event ────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema({
  title:               { type: String, required: true, trim: true },
  description:         { type: String },
  location:            { type: String },
  eventDate:           { type: Date, required: true },
  requiredVolunteers:  { type: Number, default: 0 },
  status:              { type: String, enum: ['upcoming','ongoing','completed','cancelled'], default: 'upcoming' },
  registeredVolunteers:{ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  createdBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Project ──────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String },
  location:      { type: String },
  startDate:     { type: Date },
  endDate:       { type: Date },
  status:        { type: String, enum: ['planning','active','completed','on-hold'], default: 'planning' },
  impactSummary: { type: String },
  coverImage:    { type: String },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Announcement ─────────────────────────────────────────────────
const announcementSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  content:   { type: String, required: true },
  isPublic:  { type: Boolean, default: true },
  postedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Audit Log ────────────────────────────────────────────────────
const auditLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:    { type: String, required: true },
  details:   { type: String },
  ipAddress: { type: String },
}, { timestamps: true });

// ── Backup Config (singleton) ─────────────────────────────────────
const backupConfigSchema = new mongoose.Schema({
  singleton:      { type: String, default: 'config', unique: true },
  frequency:      { type: String, enum: ['hourly','daily','weekly','monthly'], default: 'daily' },
  backupTime:     { type: String, default: '02:00' },
  localEnabled:   { type: Boolean, default: true },
  cloudEnabled:   { type: Boolean, default: false },
  cloudProvider:  { type: String, enum: ['gcs','s3','azure'], default: 'gcs' },
  bucketName:     { type: String },
  retentionDays:  { type: Number, default: 30 },
  lastRun:        { type: Date },
}, { timestamps: true });

// ── Backup History ────────────────────────────────────────────────
const backupHistorySchema = new mongoose.Schema({
  filename:    { type: String, required: true },
  localPath:   { type: String },
  cloudPath:   { type: String },
  cloudStatus: { type: String, default: 'skipped' },
  sizeBytes:   { type: Number },
  triggeredBy: { type: String, enum: ['auto','manual'], default: 'auto' },
  status:      { type: String, enum: ['success','failed'], default: 'success' },
  errorMessage:{ type: String },
}, { timestamps: true });

module.exports = {
  Event:         mongoose.model('Event',         eventSchema),
  Project:       mongoose.model('Project',       projectSchema),
  Announcement:  mongoose.model('Announcement',  announcementSchema),
  AuditLog:      mongoose.model('AuditLog',      auditLogSchema),
  BackupConfig:  mongoose.model('BackupConfig',  backupConfigSchema),
  BackupHistory: mongoose.model('BackupHistory', backupHistorySchema),
};
