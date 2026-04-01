const nodemailer = require("nodemailer");
const { otpTemplate } = require("./emailTemplates");
require("dotenv").config();

const isDevMode = process.env.NODE_ENV !== "production";
const smtpUser = String(process.env.SMTP_USER || "").trim();
const smtpPass = String(process.env.SMTP_PASS || "").trim();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Graphura" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: otpTemplate(otp),
    });

    console.log("OTP Email sent:", info.messageId);
    return true;
  } catch (err) {
    const isAuthFailure = /535|authentication failed|invalid login/i.test(
      String(err?.message || "")
    );

    if (isAuthFailure) {
      console.error(
        "SMTP Error: Authentication failed. Verify SMTP_USER/SMTP_PASS and provider restrictions (Brevo sender/domain)."
      );
    } else {
      console.error("SMTP Error:", err.message);
    }

    if (isDevMode) {
      console.log("\n🔧 DEV MODE OTP:", otp, `(for ${email})\n`);
      return true;
    }

    return false;
  }
};

module.exports = { sendOTPEmail };