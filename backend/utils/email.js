const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const BRAND = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#1e1408;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="color:#e8a84e;margin:0;font-size:22px;">Touch of Hope CBO</h1>
      <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:13px;">Spreading Hope, Changing Lives</p>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #f0e6d2;border-top:none;">
`;
const BRAND_CLOSE = `
    </div>
    <div style="background:#faf6ef;padding:14px 32px;border-radius:0 0 12px 12px;border:1px solid #f0e6d2;border-top:none;text-align:center;">
      <p style="color:#6b4f2a;font-size:11px;margin:0;">© 2025 Touch of Hope CBO · Nairobi, Kenya</p>
    </div>
  </div>
`;

// ── Email templates ───────────────────────────────────────────────
const templates = {
  verifyEmail: (name, link) => ({
    subject: 'Verify your email — Touch of Hope CBO',
    html: `${BRAND}
      <h2 style="color:#1e1408;">Welcome, ${name}! 👋</h2>
      <p>Thank you for registering. Please verify your email address to complete your application.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${link}" style="background:#c47a2b;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color:#6b4f2a;font-size:13px;">This link expires in 24 hours. If you did not register, you can ignore this email.</p>
    ${BRAND_CLOSE}`,
  }),

  welcomeApproved: (name, role) => ({
    subject: 'Your Touch of Hope account has been approved!',
    html: `${BRAND}
      <h2 style="color:#1e1408;">Great news, ${name}! 🎉</h2>
      <p>Your account has been approved by the Chairperson. You now have access to the <strong>${role}</strong> portal.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${process.env.FRONTEND_URL}/login.html" style="background:#2d7a1c;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Sign In Now
        </a>
      </div>
    ${BRAND_CLOSE}`,
  }),

  resetPassword: (name, link) => ({
    subject: 'Reset your password — Touch of Hope CBO',
    html: `${BRAND}
      <h2 style="color:#1e1408;">Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${link}" style="background:#c47a2b;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#6b4f2a;font-size:13px;">This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
    ${BRAND_CLOSE}`,
  }),

  donationReceipt: (name, amount, currency, method, campaign, receiptNo) => ({
    subject: `Donation Receipt — KSh ${amount.toLocaleString()} — Touch of Hope CBO`,
    html: `${BRAND}
      <h2 style="color:#1e1408;">Thank you for your donation! 💛</h2>
      <p>Dear ${name},</p>
      <p>Your generous contribution has been received. Here are your receipt details:</p>
      <div style="background:#faf6ef;border-radius:9px;padding:20px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b4f2a;font-size:13px;">Receipt No.</td><td style="padding:8px 0;font-weight:700;">${receiptNo}</td></tr>
          <tr><td style="padding:8px 0;color:#6b4f2a;font-size:13px;">Amount</td><td style="padding:8px 0;font-weight:700;color:#2d7a1c;">${currency} ${amount.toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#6b4f2a;font-size:13px;">Method</td><td style="padding:8px 0;">${method}</td></tr>
          <tr><td style="padding:8px 0;color:#6b4f2a;font-size:13px;">Campaign</td><td style="padding:8px 0;">${campaign || 'General Fund'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b4f2a;font-size:13px;">Date</td><td style="padding:8px 0;">${new Date().toLocaleDateString('en-KE', { dateStyle: 'long' })}</td></tr>
        </table>
      </div>
      <p>Your support is making a real difference in the lives of children and families across Kenya.</p>
    ${BRAND_CLOSE}`,
  }),

  newMemberNotify: (chairName, applicantName, applicantEmail) => ({
    subject: `New member application — ${applicantName}`,
    html: `${BRAND}
      <h2 style="color:#1e1408;">New Member Application</h2>
      <p>Dear ${chairName},</p>
      <p>A new member application has been submitted and requires your approval:</p>
      <div style="background:#faf6ef;border-radius:9px;padding:20px;margin:20px 0;">
        <p><strong>Name:</strong> ${applicantName}</p>
        <p><strong>Email:</strong> ${applicantEmail}</p>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${process.env.FRONTEND_URL}/portal.html" style="background:#c47a2b;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Review in Portal
        </a>
      </div>
    ${BRAND_CLOSE}`,
  }),
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured — skipping email to', to);
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const send = async (to, templateName, ...args) => {
  const tpl = templates[templateName]?.(...args);
  if (!tpl) throw new Error(`Unknown email template: ${templateName}`);
  await sendEmail({ to, ...tpl });
};

module.exports = { send, sendEmail };
