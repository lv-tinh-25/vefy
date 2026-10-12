"use client";

/**
 * - supported: can ask for permission here
 * - ios-install: iPhone/iPad in a Safari tab; push only works once added to the Home Screen
 * - unsupported: browser has no Push API (old iOS, in-app browsers like Zalo/Facebook, …)
 */
export type PushSupport = "supported" | "ios-install" | "unsupported";

function isIos(): boolean {
  // iPadOS reports itself as a Mac, so also check for touch
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function getPushSupport(): PushSupport {
  const hasApi = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (isIos() && !isStandalone()) return "ios-install";
  return hasApi ? "supported" : "unsupported";
}

export function getPermission(): NotificationPermission {
  return "Notification" in window ? Notification.permission : "denied";
}

/** Registers the service worker ahead of time, so a later click can subscribe without waiting */
export async function prepareServiceWorker(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  return navigator.serviceWorker.ready;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (getPushSupport() !== "supported") return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Drops this browser's subscription, server side first (needs the session), then locally */
export async function removeDeviceSubscription(removeOnServer: (endpoint: string) => Promise<unknown>) {
  const sub = await getCurrentSubscription();
  if (!sub) return;
  await removeOnServer(sub.endpoint);
  await sub.unsubscribe();
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * Call synchronously from the click handler, with nothing awaited before it: Safari only accepts
 * subscribe() during the tap's user activation and rejects it with NotAllowedError otherwise.
 * subscribe() shows the permission prompt itself and returns the existing subscription if any.
 */
export function subscribeToPush(registration: ServiceWorkerRegistration, vapidPublicKey: string): Promise<PushSubscription> {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}
