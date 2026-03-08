// iNotebook Service Worker - Notifications + Offline Support

const CACHE_NAME = "inotebook-v1";
const OFFLINE_URLS = ["/", "/index.html"];

// Install - cache core files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, cache fallback
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses for offline use
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match("/")))
  );
});

// Listen for messages from the app
self.addEventListener("message", (e) => {
  if (e.data.type === "SCHEDULE_REMINDER") {
    const { id, title, description, remindAt } = e.data;
    const delay = new Date(remindAt).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification("iNotebook Reminder", {
          body: `${title}: ${description.slice(0, 100)}`,
          icon: "/icon-192.svg",
          badge: "/icon-192.svg",
          tag: `reminder-${id}`,
          vibrate: [200, 100, 200],
          data: { noteId: id },
          actions: [
            { action: "open", title: "Open Note" },
            { action: "dismiss", title: "Dismiss" },
          ],
        });
      }, delay);
    }
  }
});

// Notification click
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "open" || !e.action) {
    e.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        if (clients.length > 0) {
          clients[0].focus();
        } else {
          self.clients.openWindow("/");
        }
      })
    );
  }
});
