const nodemailer = require("nodemailer");

const sendContactMail = async ({ name, email, message }) => {
  try {
    // Validate SMTP credentials
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL) {
      throw new Error("❌ SMTP configuration is incomplete. Check environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL");
    }
    
    // Create transporter using SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email to admin
    const adminEmail = {
      from: `"Bakery Website" <${process.env.FROM_EMAIL}>`,
      to: process.env.FROM_EMAIL,
      replyTo: email,
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #e11d48;">New Contact Message</h2>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <p><strong style="color: #333;">👤 Name:</strong> ${name}</p>
            <p><strong style="color: #333;">📧 Email:</strong> <a href="mailto:${email}" style="color: #e11d48;">${email}</a></p>
            
            <p><strong style="color: #333;">💬 Message:</strong></p>
            <p style="background: #f5f5f5; padding: 12px; border-left: 4px solid #e11d48; border-radius: 4px; color: #555;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
            <p>This message was sent from your Bakery website contact form.</p>
          </div>
        </div>
      `,
    };

    // Send email to admin
    await transporter.sendMail(adminEmail);
    console.log("✅ Contact email sent to admin successfully");

    // Send confirmation email to user
    const userEmail = {
      from: `"Graphura Bakery" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "🍰 We received your message! - Graphura Bakery",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #fff1f5 0%, #ffffff 100%); border-radius: 8px;">
          <h2 style="color: #e11d48;">Thank you for reaching out! 🎉</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Hi <strong>${name}</strong>,<br><br>
            We've received your message and appreciate you contacting Graphura Bakery. Our team will get back to you as soon as possible with more details about your cake order or inquiry.
          </p>

          <div style="background: #ffe4ea; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #e11d48;">
            <p style="color: #333; margin: 0;"><strong>Your Message:</strong></p>
            <p style="color: #666; margin-top: 10px;">${message.replace(/\n/g, "<br>")}</p>
          </div>

          <p style="color: #555;">
            <strong>Contact us directly:</strong><br>
            📞 WhatsApp: <a href="https://api.whatsapp.com/send/?phone=7378021327" style="color: #e11d48; text-decoration: none;">WhatsApp</a><br>
            📧 Email: <a href="mailto:${process.env.FROM_EMAIL}" style="color: #e11d48; text-decoration: none;">${process.env.FROM_EMAIL}</a><br>
            📍 Instagram: <a href="https://www.instagram.com/graphura.in" style="color: #e11d48; text-decoration: none;">@graphura.in</a>
          </p>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center;">
            <p>Graphura Bakery - Baking Happiness Since 2020 🍪</p>
          </div>
        </div>
      `,
    };

    // Send confirmation email to user
    await transporter.sendMail(userEmail);
    console.log("✅ Confirmation email sent to user successfully");

    return true;
  } catch (err) {
    console.error("❌ Email sending error:", {
      message: err.message,
      code: err.code,
      command: err.command,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Email sending failed: ${err.message}`);
  }
};

module.exports = sendContactMail;
