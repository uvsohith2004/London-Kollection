let transporterPromise = null;

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || user;
  const service = process.env.SMTP_SERVICE || (!host && user ? "gmail" : undefined);

  return {
    host,
    port,
    user,
    pass,
    from,
    service,
    secure: port === 465,
    configured: Boolean(user && pass && from && (host || service)),
  };
};

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = import("nodemailer").then(({ default: nodemailer }) => {
      const smtpConfig = getSmtpConfig();

      if (!smtpConfig.configured) {
        throw new Error("SMTP is not configured");
      }

      return nodemailer.createTransport({
        ...(smtpConfig.host
          ? {
              host: smtpConfig.host,
              port: smtpConfig.port,
              secure: smtpConfig.secure,
            }
          : {
              service: smtpConfig.service || "gmail",
            }),
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });
    });
  }

  return transporterPromise;
}

export async function sendResetOtpEmail({ to, name, otp, expiresInMinutes }) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig.configured) {
    const error = new Error("Email service is not configured for password reset emails");
    error.statusCode = 500;
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  const transporter = await getTransporter();

  await transporter.sendMail({
    from: smtpConfig.from,
    to,
    subject: "Password Reset OTP",
    text: `Hello ${name || "User"}, your password reset OTP is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html: `
      <div style="background:#f5f5f4;padding:32px 16px;font-family:Arial,sans-serif;color:#1c1917;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:24px;overflow:hidden;">
          <div style="padding:24px 32px;background:#111827;color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;opacity:0.8;">London Kollection</p>
            <h2 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Password Reset OTP</h2>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;">Hello ${name || "User"},</p>
            <p style="margin:0 0 20px;line-height:1.6;">Use the one-time password below to reset your account password. This code expires in ${expiresInMinutes} minutes.</p>
            <div style="margin:24px 0;padding:18px 20px;border-radius:18px;background:#f5f5f4;text-align:center;font-size:32px;font-weight:700;letter-spacing:10px;">
              ${otp}
            </div>
            <p style="margin:0 0 12px;line-height:1.6;">If you did not request this reset, you can safely ignore this email.</p>
            <p style="margin:0;color:#78716c;font-size:13px;">For your security, never share this OTP with anyone.</p>
          </div>
        </div>
      </div>
    `,
  });

  return {
    success: true,
    mode: "smtp",
  };
}
