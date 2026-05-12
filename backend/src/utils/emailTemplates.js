// OTP Email Template
const otpTemplate = (otp) => {
  return `
    <div style="
      background:#f9f9f9;
      padding:20px;
      border-radius:8px;
      font-family:Arial, sans-serif;
      max-width:450px;
      margin:auto;
      border:1px solid #e5e5e5;
    ">
      <h2 style="color:#333; text-align:center;">Your OTP Code</h2>

      <p style="font-size:16px; color:#555;">
        Use the OTP below to complete your verification:
      </p>

      <div style="
        background:#fff;
        padding:15px;
        text-align:center;
        border-radius:6px;
        font-size:22px;
        font-weight:bold;
        border:1px dashed #666;
        letter-spacing:3px;
      ">
        ${otp}
      </div>

      <p style="font-size:14px; color:#777; margin-top:20px;">
        This OTP is valid for <strong>5 minutes</strong>.  
        If you did not request this, you can ignore this email.
      </p>

      <p style="color:#333; margin-top:20px; text-align:center;">
        ❤️ From the Graphura Team
      </p>
    </div>
  `;
};

module.exports = { otpTemplate };
