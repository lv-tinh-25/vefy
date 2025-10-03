import nodemailer from "nodemailer";

const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || `Vefy <${process.env.SMTP_USER}>`;

interface ActionEmail {
  to: string;
  subject: string;
  heading: string;
  body: string;
  buttonLabel: string;
  url: string;
  footer: string;
}

// Plain-text part alongside HTML lowers the chance of landing in spam
async function sendActionEmail({ to, subject, heading, body, buttonLabel, url, footer }: ActionEmail) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text: `${heading}\n\n${body}\n${url}\n\n${footer}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#00d4aa;margin-bottom:16px">${heading}</h2>
        <p>${body}</p>
        <a href="${url}" style="display:inline-block;background:#00d4aa;color:#080b12;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          ${buttonLabel}
        </a>
        <p style="color:#888;font-size:14px;margin-top:24px">${footer}</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(to: string, url: string) {
  await sendActionEmail({
    to,
    url,
    subject: "Xác minh email — Vefy",
    heading: "Chào mừng đến với Vefy!",
    body: "Nhấn nút bên dưới để xác minh email của bạn (link có hiệu lực 30 phút):",
    buttonLabel: "Xác minh email",
    footer: "Nếu bạn không tạo tài khoản Vefy, hãy bỏ qua email này.",
  });
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await sendActionEmail({
    to,
    url,
    subject: "Đặt lại mật khẩu — Vefy",
    heading: "Đặt lại mật khẩu",
    body: "Nhấn nút bên dưới để đặt mật khẩu mới (link có hiệu lực 30 phút và chỉ dùng được 1 lần):",
    buttonLabel: "Đặt lại mật khẩu",
    footer: "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn giữ nguyên.",
  });
}
