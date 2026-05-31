import webpush from "web-push";
import dotenv from "dotenv";
dotenv.config();

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn("⚠️ VAPID keys not configured in .env");
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

export async function sendPush(subscription: any, payload: any) {
  try {
    const pushPayload = JSON.stringify(payload);
    await webpush.sendNotification(subscription, pushPayload);
    return { ok: true };
  } catch (err: any) {
    console.error("sendPush error:", err?.body || err);
    return { ok: false, error: err };
  }
}

export { VAPID_PUBLIC };
