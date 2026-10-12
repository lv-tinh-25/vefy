import { createHmac, timingSafeEqual } from "node:crypto";

// Signed with the auth secret so the link in a reminder email can only turn off that user's emails
function sign(userId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET must be set");
  return createHmac("sha256", secret).update(`email-reminders:${userId}`).digest("base64url");
}

export function createUnsubscribeToken(userId: string): string {
  return `${Buffer.from(userId).toString("base64url")}.${sign(userId)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [encodedId, signature] = token.split(".");
  if (!encodedId || !signature) return null;
  const userId = Buffer.from(encodedId, "base64url").toString();
  const expected = Buffer.from(sign(userId));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? userId : null;
}
