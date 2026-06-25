const CACHE_NAME = "arcangel-v1";
const SHELL_ASSETS = [
  "/",
  "/categorias",
  "/favoritos",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("push", (e) => {
  const d = e.data?.json() ?? {};
  e.waitUntil(self.registration.showNotification(d.title || "Arcángel", { body: d.body }));
});

self.addEventListener("message", (e) => {
  if (e.data?.type !== "SCHEDULE_NOTIF") return;
  const delay = e.data.delay;
  setTimeout(() => {
    self.registration.showNotification("Arcángel – Versículo del Día", {
      body: e.data.verse,
      icon: "/favicon.svg"
    });
  }, delay);
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API calls: network first, then cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
    )
  );
});
