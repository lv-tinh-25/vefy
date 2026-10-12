// Vefy service worker: shows reminder push notifications and opens the app when one is tapped.
// Served with Cache-Control: no-cache (next.config.ts) so updates reach browsers right away.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Vefy", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      // Same tag replaces yesterday's reminder instead of stacking them
      tag: data.tag || "vefy",
      renotify: true,
      data: { url: data.url || "/garage" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/garage", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        return existing.navigate(url);
      }
      return self.clients.openWindow(url);
    })(),
  );
});

// Some browsers rotate the subscription; re-register it so reminders keep arriving
self.addEventListener("pushsubscriptionchange", (event) => {
  const options = event.oldSubscription?.options;
  if (!options) return;
  event.waitUntil(
    self.registration.pushManager.subscribe(options).then((sub) =>
      fetch("/api/notifications/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      }),
    ),
  );
});
