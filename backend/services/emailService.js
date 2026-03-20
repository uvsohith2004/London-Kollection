export async function sendResetOtpEmail({ to, name, otp, expiresInMinutes }) {
  const emailConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM;

  if (!emailConfigured) {
    console.warn("[EMAIL_SERVICE] SMTP not configured. OTP generated for development only.", {
      to,
      otp,
      expiresInMinutes,
    });

    return {
      success: true,
      mode: "development-log",
    };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your password reset OTP",
    text: `Hello ${name || "User"}, your OTP is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Password Reset OTP</h2>
        <p>Hello ${name || "User"},</p>
        <p>Use the OTP below to reset your password:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${otp}</div>
        <p>This OTP expires in ${expiresInMinutes} minutes.</p>
      </div>
    `,
  });

  return {
    success: true,
    mode: "smtp",
  };
}
