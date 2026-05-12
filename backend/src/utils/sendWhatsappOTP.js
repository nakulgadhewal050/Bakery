const axios = require("axios");

const sendWhatsAppOTP = async (phone, otp) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: `${phone}`,  // MUST be a string like "918743942135"
        type: "text",
        text: {
          body: `Your NoteShare OTP is: ${otp}. Valid for 5 minutes.`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📤 WhatsApp OTP Sent:", response.data);
    return true;
  } catch (error) {
    console.error("❌ WhatsApp OTP Error:", error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendWhatsAppOTP };
