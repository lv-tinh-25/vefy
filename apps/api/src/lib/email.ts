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

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export interface ReminderEmailGroup {
  vehicleName: string;
  lines: string[];
}

interface ReminderEmail {
  to: string;
  groups: ReminderEmailGroup[];
  appUrl: string;
  unsubscribeUrl: string;
}

export async function sendReminderEmail({ to, groups, appUrl, unsubscribeUrl }: ReminderEmail) {
  const count = groups.reduce((n, g) => n + g.lines.length, 0);
  const subject =
    count === 1 ? `${groups[0].lines[0]} — ${groups[0].vehicleName}` : `${count} việc cần chú ý cho xe của bạn — Vefy`;

  const text = [
    "Nhắc nhở từ Vefy",
    "",
    ...groups.flatMap((g) => [g.vehicleName, ...g.lines.map((l) => `  • ${l}`), ""]),
    `Mở Vefy: ${appUrl}`,
    "",
    `Không muốn nhận email nhắc nhở nữa? ${unsubscribeUrl}`,
  ].join("\n");

  // Explicit colours: without them dark-mode mail clients render dark text on a dark background
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;color:#111111;border-radius:12px">
      <h2 style="color:#00d4aa;margin-bottom:16px">Nhắc nhở từ Vefy</h2>
      ${groups
        .map(
          (g) => `
        <p style="font-weight:600;margin:20px 0 6px">${escapeHtml(g.vehicleName)}</p>
        <ul style="margin:0;padding-left:20px">
          ${g.lines.map((l) => `<li style="margin:4px 0">${escapeHtml(l)}</li>`).join("")}
        </ul>`,
        )
        .join("")}
      <a href="${appUrl}" style="display:inline-block;background:#00d4aa;color:#080b12;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0 16px">
        Mở Vefy
      </a>
      <p style="color:#888;font-size:13px;margin-top:24px">
        Bạn nhận email này vì đã bật nhắc nhở trên Vefy.
        <a href="${unsubscribeUrl}" style="color:#888">Tắt email nhắc nhở</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text,
    html,
    // One-click unsubscribe (RFC 8058), expected by Gmail and Yahoo for recurring mail
    list: { unsubscribe: { url: unsubscribeUrl, comment: "Tắt email nhắc nhở" } },
    headers: { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}
