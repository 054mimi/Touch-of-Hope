const express  = require('express');
const { body, validationResult } = require('express-validator');
const stripe   = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User     = require('../models/User');
const email    = require('../utils/email');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// ── Helper: send donation receipt ────────────────────────────────
async function sendReceipt(donation) {
  try {
    const toEmail = donation.donorEmail || (donation.donorUser ? (await User.findById(donation.donorUser))?.email : null);
    if (!toEmail) return;
    const campaign = donation.campaign ? (await Campaign.findById(donation.campaign))?.title : null;
    const receipt  = donation.mpesaReceiptNumber || donation.stripePaymentIntentId?.slice(-8).toUpperCase() || donation.paypalCaptureId?.slice(-8) || donation._id.toString().slice(-8).toUpperCase();
    await email.send(toEmail, 'donationReceipt', donation.donorName, donation.amount, donation.currency, donation.paymentMethod.toUpperCase(), campaign, receipt);
  } catch (e) { console.error('[Receipt email error]', e.message); }
}

// ════════════════════════════════════════════════════════════════
//  STRIPE — cards, Apple Pay, Google Pay, bank redirects (SEPA, etc.)
// ════════════════════════════════════════════════════════════════

// POST /api/payments/stripe/create-intent
// Creates a Stripe PaymentIntent, returns client_secret to frontend
router.post('/stripe/create-intent', optionalAuth,
  body('amount').isInt({ min: 10, max: 100000000 }).withMessage('Donation amount must be between 10 and 100,000,000'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3-letter code'),
  body('donorName').optional().trim().isLength({ max: 100 }),
  body('donorEmail').optional().isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    const { amount, currency = 'kes', campaignId, donorName, donorEmail } = req.body;
    try {
      // Create pending donation record first
      const donation = await Donation.create({
        donorUser:     req.user?._id || null,
        donorName:     donorName || req.user?.name || 'Anonymous',
        donorEmail:    donorEmail || req.user?.email || null,
        campaign:      campaignId || null,
        amount,
        currency:      currency.toUpperCase(),
        paymentMethod: 'stripe',
        status:        'pending',
      });

      const intent = await stripe.paymentIntents.create({
        amount:   amount * 100,           // Stripe uses smallest currency unit
        currency: currency.toLowerCase(),
        metadata: { donationId: donation._id.toString(), campaignId: campaignId || '' },
        automatic_payment_methods: { enabled: true },
      });

      // Save intent ID
      donation.stripePaymentIntentId = intent.id;
      await donation.save();

      res.json({ clientSecret: intent.client_secret, donationId: donation._id });
    } catch (e) {
      console.error('[Stripe]', e.message);
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Payment error' : e.message });
    }
  }
);

// POST /api/payments/stripe/webhook — Stripe calls this on payment events
// Raw body required for signature verification
router.post('/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (e) {
      console.error('[Stripe Webhook] Signature verification failed:', e.message);
      return res.status(400).json({ error: `Webhook error: ${e.message}` });
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const intent   = event.data.object;
        const donation = await Donation.findOne({ stripePaymentIntentId: intent.id });
        if (donation && donation.status === 'pending') {
          // Idempotent: only update if currently pending
          donation.status      = 'completed';
          donation.confirmedAt = new Date();
          await donation.save();
          await sendReceipt(donation);
          console.log(`[Stripe] Donation confirmed: ${donation._id}`);
        }
      }

      if (event.type === 'payment_intent.payment_failed') {
        const intent   = event.data.object;
        const donation = await Donation.findOne({ stripePaymentIntentId: intent.id });
        if (donation && donation.status === 'pending') {
          donation.status = 'failed';
          await donation.save();
          console.log(`[Stripe] Donation failed: ${donation._id}`);
        }
      }

      res.json({ received: true });
    } catch (e) {
      console.error('[Stripe Webhook] Processing error:', e.message);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// GET /api/payments/stripe/publishable-key — frontend fetches this
router.get('/stripe/publishable-key', (req, res) => {
  res.json({ key: process.env.STRIPE_PUBLISHABLE_KEY });
});

// ════════════════════════════════════════════════════════════════
//  M-PESA STK Push
// ════════════════════════════════════════════════════════════════
async function getMpesaToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const base = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
  const r = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  }).then(r => r.json());
  return { token: r.access_token, base };
}

// POST /api/payments/mpesa/initiate
router.post('/mpesa/initiate', optionalAuth,
  body('phone').matches(/^254\d{9}$/).withMessage('Phone must be 254XXXXXXXXX format'),
  body('amount').isInt({ min: 1, max: 500000 }).withMessage('Amount must be between 1 and 500,000'),
  body('donorName').optional().trim().isLength({ max: 100 }),
  body('donorEmail').optional().isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    const { phone, amount, campaignId, donorName, donorEmail } = req.body;
    try {
      const { token, base } = await getMpesaToken();
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      const shortcode = process.env.MPESA_SHORTCODE;
      const passkey   = process.env.MPESA_PASSKEY;
      const password  = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      const callbackUrl = `${process.env.API_BASE_URL}/api/payments/mpesa/callback`;

      const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          BusinessShortCode: shortcode,
          Password:          password,
          Timestamp:         timestamp,
          TransactionType:   'CustomerPayBillOnline',
          Amount:            amount,
          PartyA:            phone,
          PartyB:            shortcode,
          PhoneNumber:       phone,
          CallBackURL:       callbackUrl,
          AccountReference:  'TouchOfHope',
          TransactionDesc:   `Donation${campaignId ? ` - Campaign` : ''}`,
        }),
      }).then(r => r.json());

      if (stkRes.ResponseCode !== '0') throw new Error(stkRes.ResponseDescription || 'M-Pesa request failed');

      const donation = await Donation.create({
        donorUser:     req.user?._id || null,
        donorName:     donorName || req.user?.name || 'Anonymous',
        donorEmail:    donorEmail || req.user?.email || null,
        campaign:      campaignId || null,
        amount,
        currency:      'KES',
        paymentMethod: 'mpesa',
        mpesaCheckoutId: stkRes.CheckoutRequestID,
        status:        'pending',
      });

      res.json({
        message:    'STK Push sent. Check your phone and enter your M-Pesa PIN.',
        checkoutId: stkRes.CheckoutRequestID,
        donationId: donation._id,
      });
    } catch (e) {
      console.error('[M-Pesa]', e.message);
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'M-Pesa error' : e.message });
    }
  }
);

// POST /api/payments/mpesa/callback — Safaricom webhook
router.post('/mpesa/callback', async (req, res) => {
  try {
    const cb  = req.body.Body?.stkCallback;
    if (!cb) return res.sendStatus(200);

    const checkoutId = cb.CheckoutRequestID;
    if (cb.ResultCode === 0) {
      const items  = cb.CallbackMetadata?.Item || [];
      const get    = (n) => items.find(i => i.Name === n)?.Value;
      const donation = await Donation.findOneAndUpdate(
        { mpesaCheckoutId: checkoutId },
        { status: 'completed', mpesaReceiptNumber: get('MpesaReceiptNumber'), confirmedAt: new Date() },
        { new: true }
      );
      if (donation) await sendReceipt(donation);
    } else {
      await Donation.findOneAndUpdate({ mpesaCheckoutId: checkoutId }, { status: 'failed' });
    }
    res.sendStatus(200);
  } catch (e) { console.error('[M-Pesa CB]', e); res.sendStatus(500); }
});

// GET /api/payments/mpesa/status/:checkoutId
router.get('/mpesa/status/:checkoutId', async (req, res) => {
  const d = await Donation.findOne({ mpesaCheckoutId: req.params.checkoutId }).populate('campaign', 'title');
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json({ status: d.status, amount: d.amount, receipt: d.mpesaReceiptNumber, campaign: d.campaign?.title });
});

// ════════════════════════════════════════════════════════════════
//  PAYPAL
// ════════════════════════════════════════════════════════════════
async function getPaypalToken() {
  const base = process.env.PAYPAL_ENV === 'production'
    ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  }).then(r => r.json());
  return { token: r.access_token, base };
}

// POST /api/payments/paypal/create-order
router.post('/paypal/create-order', optionalAuth,
  body('amount').isFloat({ min: 1, max: 999999 }).withMessage('Amount must be between 1 and 999,999'),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('donorName').optional().trim().isLength({ max: 100 }),
  body('donorEmail').optional().isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    const { amount, currency = 'USD', campaignId, donorName, donorEmail } = req.body;
    try {
      const { token, base } = await getPaypalToken();
      const order = await fetch(`${base}/v2/checkout/orders`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) }, description: 'Touch of Hope Donation' }],
          application_context: {
            return_url: `${process.env.FRONTEND_URL}/portal.html?paypal=success`,
            cancel_url: `${process.env.FRONTEND_URL}/portal.html?paypal=cancel`,
          },
        }),
      }).then(r => r.json());

      const donation = await Donation.create({
        donorUser:     req.user?._id || null,
        donorName:     donorName || req.user?.name || 'Anonymous',
        donorEmail:    donorEmail || req.user?.email || null,
        campaign:      campaignId || null,
        amount,
        currency,
        paymentMethod: 'paypal',
        paypalOrderId: order.id,
        status:        'pending',
      });

      res.json({ orderId: order.id, approveUrl: order.links?.find(l => l.rel === 'approve')?.href, donationId: donation._id });
    } catch (e) {
      console.error('[PayPal]', e.message);
      res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'PayPal error' : e.message });
    }
  }
);

// POST /api/payments/paypal/capture-order
router.post('/paypal/capture-order',
  body('orderId').notEmpty(),
  validate,
  async (req, res) => {
    try {
      const { token, base } = await getPaypalToken();
      const capture = await fetch(`${base}/v2/checkout/orders/${req.body.orderId}/capture`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }).then(r => r.json());

      if (capture.status === 'COMPLETED') {
        const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        const donation  = await Donation.findOneAndUpdate(
          { paypalOrderId: req.body.orderId },
          { status: 'completed', paypalCaptureId: captureId, confirmedAt: new Date() },
          { new: true }
        );
        if (donation) await sendReceipt(donation);
        return res.json({ status: 'completed', captureId });
      }
      res.status(400).json({ error: 'Payment not completed', status: capture.status });
    } catch (e) {
      console.error('[PayPal capture]', e.message);
      res.status(500).json({ error: e.message });
    }
  }
);

// ════════════════════════════════════════════════════════════════
//  MANUAL DONATIONS (cash, bank transfer) — treasurer only
// ════════════════════════════════════════════════════════════════
router.post('/manual', authenticate, requireRole('treasurer'),
  body('amount').isInt({ min: 1 }),
  body('donorName').notEmpty(),
  body('method').isIn(['bank','cash']),
  validate,
  async (req, res) => {
    const { donorName, donorEmail, campaignId, amount, method, reference, date, notes } = req.body;
    try {
      const donation = await Donation.create({
        donorName,
        donorEmail:      donorEmail || null,
        campaign:        campaignId || null,
        amount,
        currency:        'KES',
        paymentMethod:   method,
        bankReference:   reference || null,
        status:          'completed',
        confirmedAt:     date ? new Date(date) : new Date(),
        recordedBy:      req.user._id,
        notes:           notes || null,
      });
      if (donorEmail) await sendReceipt(donation);
      res.status(201).json({ message: 'Donation recorded', id: donation._id });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/payments/donation/:id — check any donation status
router.get('/donation/:id', optionalAuth, async (req, res) => {
  try {
    const d = await Donation.findById(req.params.id).populate('campaign', 'title');
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json({ status: d.status, amount: d.amount, currency: d.currency, method: d.paymentMethod, campaign: d.campaign?.title });
  } catch { res.status(404).json({ error: 'Not found' }); }
});

module.exports = router;
