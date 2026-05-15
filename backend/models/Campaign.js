const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, trim: true },
  targetAmount: { type: Number, required: true, min: 1 },
  amountRaised: { type: Number, default: 0, min: 0 },
  currency:     { type: String, default: 'KES' },
  startDate:    { type: Date },
  endDate:      { type: Date },
  status:       { type: String, enum: ['active','completed','paused','cancelled'], default: 'active' },
  coverImage:   { type: String },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: percentage raised
campaignSchema.virtual('percentageRaised').get(function () {
  return this.targetAmount > 0
    ? Math.min(100, Math.round((this.amountRaised / this.targetAmount) * 100))
    : 0;
});

campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
