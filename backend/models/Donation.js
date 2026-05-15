const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorUser:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  donorName:    { type: String, default: 'Anonymous' },
  donorEmail:   { type: String },
  campaign:     { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  amount:       { type: Number, required: true, min: 1 },
  currency:     { type: String, default: 'KES' },
  // Payment method
  paymentMethod: { type: String, enum: ['mpesa','stripe','paypal','bank','cash','crypto'], required: true },
  // Gateway references
  stripePaymentIntentId: { type: String },
  stripeSessionId:       { type: String },
  mpesaCheckoutId:       { type: String },
  mpesaReceiptNumber:    { type: String },
  paypalOrderId:         { type: String },
  paypalCaptureId:       { type: String },
  bankReference:         { type: String },
  cryptoTxHash:          { type: String },
  // Status
  status:        { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
  confirmedAt:   { type: Date },
  // For manually recorded donations (cash/bank)
  recordedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:         { type: String },
}, { timestamps: true });

// After saving a completed donation, update the campaign's amountRaised
donationSchema.post('save', async function () {
  if (this.campaign && this.status === 'completed') {
    const Campaign = mongoose.model('Campaign');
    const agg = await mongoose.model('Donation').aggregate([
      { $match: { campaign: this.campaign, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const total = agg[0]?.total || 0;
    await Campaign.findByIdAndUpdate(this.campaign, { amountRaised: total });
  }
});

module.exports = mongoose.model('Donation', donationSchema);
