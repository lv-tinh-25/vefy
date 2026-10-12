import webpush, { WebPushError } from "web-push";
import { getAppOrigin } from "./origin";

let configured = false;

/** Null unless both keys are set, so the UI never offers push the server can't send */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY ? process.env.VAPID_PUBLIC_KEY : null;
}

// Configured on first use so importing the API never throws when VAPID keys are missing
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  // Apple rejects the JWT (403 BadJwtToken) unless the subject is a real mailto: or https: contact
  const origin = getAppOrigin();
  const subject = process.env.VAPID_SUBJECT || (origin.startsWith("https://") ? origin : "mailto:noreply@example.com");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

/** "gone" means the browser dropped the subscription and it should be deleted */
export type PushResult = "sent" | "gone" | "failed";

export async function sendPush(target: PushTarget, payload: PushPayload): Promise<PushResult> {
  if (!ensureConfigured()) return "failed";
  try {
    await webpush.sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(payload),
      // Reminders are only useful the same day
      { TTL: 60 * 60 * 12, urgency: "normal" },
    );
    return "sent";
  } catch (err) {
    if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) return "gone";
    console.error("[push] send failed", err instanceof WebPushError ? `${err.statusCode} ${err.body}` : err);
    return "failed";
  }
}
