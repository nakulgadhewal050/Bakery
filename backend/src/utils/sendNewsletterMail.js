const nodemailer = require("nodemailer");

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !process.env.FROM_EMAIL) {
    throw new Error(
      "SMTP configuration is incomplete. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and FROM_EMAIL."
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const buildSubscriberEmail = ({ email, isResubscribe }) => ({
  from: `"Graphura Bakery" <${process.env.FROM_EMAIL}>`,
  to: email,
  subject: isResubscribe
    ? "Welcome back to Graphura Bakery newsletter"
    : "Thanks for subscribing to Graphura Bakery",
  html: `
    <div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #fff1f5 0%, #ffffff 100%); padding: 24px; border-radius: 16px; color: #111827; max-width: 640px; margin: 0 auto;">
      <div style="background: #ffffff; border: 1px solid #fbcfe8; border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px rgba(225, 29, 72, 0.08);">
        <h1 style="margin: 0 0 12px; color: #e11d48; font-size: 28px;">${isResubscribe ? "Welcome back!" : "You’re on the list!"}</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #374151; margin: 0 0 18px;">
          Hi ${escapeHtml(email)},<br><br>
          ${isResubscribe
            ? "You have been successfully resubscribed to our newsletter. We’ll keep sending you new cakes, seasonal offers, and bakery updates."
            : "Thanks for subscribing to our newsletter. We’ll keep you updated with fresh offers, bakery news, festive combos, and special announcements."}
        </p>
        <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 16px 18px; border-radius: 12px; margin: 22px 0;">
          <p style="margin: 0; font-size: 14px; color: #be123c;"><strong>What to expect:</strong> product updates, festive deals, and new dessert launches.</p>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          If you didn’t subscribe, you can ignore this email.
        </p>
      </div>
    </div>
  `,
});

const buildAdminEmail = ({ email, isResubscribe }) => ({
  from: `"Bakery Website" <${process.env.FROM_EMAIL}>`,
  to: process.env.FROM_EMAIL,
  replyTo: email,
  subject: isResubscribe
    ? `📩 Newsletter resubscription from ${email}`
    : `📩 New newsletter subscriber: ${email}`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #e11d48; margin-top: 0;">Newsletter Subscription Alert</h2>
      <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
        <p style="margin: 0 0 10px;"><strong style="color: #333;">Email:</strong> <a href="mailto:${email}" style="color: #e11d48;">${email}</a></p>
        <p style="margin: 0;"><strong style="color: #333;">Action:</strong> ${isResubscribe ? "Resubscribed" : "New subscription"}</p>
      </div>
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
        <p>This notification was sent from the Graphura Bakery newsletter form.</p>
      </div>
    </div>
  `,
});

const sendNewsletterMail = async ({ email, isResubscribe = false }) => {
  const transporter = createTransporter();

  const [adminResult, subscriberResult] = await Promise.all([
    transporter.sendMail(buildAdminEmail({ email, isResubscribe })),
    transporter.sendMail(buildSubscriberEmail({ email, isResubscribe })),
  ]);

  console.log("✅ Newsletter emails sent", {
    email,
    isResubscribe,
    adminMessageId: adminResult.messageId,
    subscriberMessageId: subscriberResult.messageId,
  });

  return true;
};

module.exports = sendNewsletterMail;