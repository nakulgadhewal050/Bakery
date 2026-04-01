const axios = require("axios");

const sendContactMail = async ({ name, email, message }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.FROM_EMAIL,
          name: "Bakery Website",
        },

        to: [
          {
            email: process.env.FROM_EMAIL,   // admin receives
            name: "Bakery Admin",
          },
        ],

        replyTo: { email },

        subject: "📩 New Contact Message",

        htmlContent: `
          <div style="font-family:Arial; padding:20px;">
            <h2>New Contact Message</h2>

            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>

            <p><strong>Message:</strong></p>
            <p style="background:#f5f5f5;padding:10px;border-radius:6px;">
              ${message}
            </p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Brevo contact email sent:", response.data);
    return true;
  } catch (err) {
    console.error(
      "❌ Brevo Contact Error:",
      err.response?.data || err.message
    );
    return false;
  }
};

module.exports = sendContactMail;
