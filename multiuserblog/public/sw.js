/**
 * Service Worker for Multi-User Engineering Blog PWA
 *
 * Strategy:
 *  - Static assets (JS/CSS/fonts/images) → Cache First
 *  - API requests (/api/*) → Network First, fall back to cache
 *  - Navigation (HTML pages) → Network First, fall back to offline page
 */

const CACHE_NAME = "engineerblog-v1";
const OFFLINE_URL = "/offline.html";

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // ── API calls: Network First ─────────────────────────────────────
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── Navigation (page loads): Network First w/ offline fallback ───
  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  // ── Static assets: Cache First ───────────────────────────────────
  event.respondWith(cacheFirst(request));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached ?? Response.json({ error: "You are offline." }, { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response("Resource not available offline.", { status: 503 });
  }
}

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Show the dedicated offline page as last resort
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage ?? new Response("You are offline.", { status: 503 });
  }
}
