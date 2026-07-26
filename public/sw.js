// Minimal service worker for Pricele.
//
// Its jobs are deliberately small:
//   1. Make the site an installable PWA (a home-screen icon is the most reliable
//      "come back tomorrow" reminder a no-backend daily game can have).
//   2. Handle taps on the daily reminder notification by focusing/opening the app.
//
// We intentionally do NOT cache-bust or precache Next.js build assets here —
// getting that wrong silently serves stale hashed bundles. A pass-through fetch
// handler is enough to satisfy the installability criteria.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Present but intentionally a no-op pass-through: required for installability,
// without interfering with Next's own asset/versioning behavior.
self.addEventListener("fetch", () => {});

// Tapping the "play today's puzzle" reminder should bring the player straight in.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow("/");
      })
  );
});
