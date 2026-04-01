// utils/sendSMS.js
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const sendOTPSMS = async (number, otp) => {
  try {
    await client.messages.create({
      body: `Your NoteShare OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE, // Your Twilio Number
      to: number, // User phone number
    });

    console.log("OTP SMS sent to:", number);
  } catch (error) {
    console.error("SMS sending error:", error);
    throw new Error("Failed to send OTP SMS");
  }
};

module.exports = { sendOTPSMS };
