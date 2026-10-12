import { Hono } from "hono";
import { verifyUnsubscribeToken } from "../lib/unsubscribe-token";
import * as reminderService from "../services/reminder.service";

function page(title: string, body: string) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} · Vefy</title></head>
<body style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;padding:48px 24px;color:#111">
<h2 style="color:#00a887">${title}</h2>${body}</body></html>`;
}

const invalid = page("Link không hợp lệ", "<p>Link tắt email đã hỏng hoặc hết hiệu lực. Bạn có thể tắt email nhắc nhở trong trang Tài khoản.</p>");

// Public: opened from the link in a reminder email, without a session
export const reminderRoutes = new Hono()
  // GET only confirms, so link scanners in mail clients can't unsubscribe anyone by prefetching
  .get("/unsubscribe", (c) => {
    const token = c.req.query("token") ?? "";
    if (!verifyUnsubscribeToken(token)) return c.html(invalid, 400);
    return c.html(
      page(
        "Tắt email nhắc nhở?",
        `<p>Bạn sẽ không nhận email nhắc bảo hành, giấy tờ, nhớt nữa. Thông báo trong app vẫn hoạt động.</p>
<form method="post"><button style="background:#00d4aa;border:0;border-radius:8px;padding:12px 24px;font-weight:600;font-size:15px;cursor:pointer">Tắt email nhắc nhở</button></form>`,
      ),
    );
  })
  // Also the RFC 8058 one-click endpoint mail clients POST to
  .post("/unsubscribe", async (c) => {
    const userId = verifyUnsubscribeToken(c.req.query("token") ?? "");
    if (!userId) return c.html(invalid, 400);
    await reminderService.setEmailReminders(userId, false);
    return c.html(page("Đã tắt email nhắc nhở", "<p>Bạn có thể bật lại bất cứ lúc nào trong trang Tài khoản của Vefy.</p>"));
  });
