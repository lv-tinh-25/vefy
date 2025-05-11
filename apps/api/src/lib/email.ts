import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Vefy <noreply@vefy.app>";

export async function sendVerificationEmail(to: string, url: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Xác minh email — Vefy",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#00d4aa;margin-bottom:16px">Chào mừng đến với Vefy!</h2>
        <p>Nhấn nút bên dưới để xác minh email của bạn:</p>
        <a href="${url}" style="display:inline-block;background:#00d4aa;color:#080b12;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Xác minh email
        </a>
        <p style="color:#888;font-size:14px;margin-top:24px">
          Nếu bạn không tạo tài khoản Vefy, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
}
