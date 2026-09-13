const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `jans-tech-${CACHE_VERSION}`;
const FONT_AWESOME_ORIGIN = "https://cdnjs.cloudflare.com";

const APP_SHELL = [
  "./",
  "./index.html",
  "./pages/index.html",
  "./pages/introduction.html",
  "./pages/setup.html",
  "./pages/variables.html",
  "./pages/data-types.html",
  "./pages/operators.html",
  "./pages/strings.html",
  "./pages/control-flow.html",
  "./pages/loops.html",
  "./pages/functions.html",
  "./pages/lists.html",
  "./pages/tuples-set.html",
  "./pages/dictionaries.html",
  "./pages/files.html",
  "./pages/errors.html",
  "./pages/oop.html",
  "./pages/modules.html",
  "./pages/decoraters.html",
  "./pages/async.html",
  "./pages/libraries.html",
  "./pages/contact.html",
  "./offline.html",
  "./css/style.css",
  "./js/main.js",
  "./images/file_000000009b7c71f4a444e25e82786492.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

const FONT_AWESOME_ASSETS = [
  `${FONT_AWESOME_ORIGIN}/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css`,
  `${FONT_AWESOME_ORIGIN}/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-brands-400.woff2`,
  `${FONT_AWESOME_ORIGIN}/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-regular-400.woff2`,
  `${FONT_AWESOME_ORIGIN}/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2`
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);

    // A CDN outage should not prevent the local app from installing.
    await Promise.allSettled(FONT_AWESOME_ASSETS.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter(cacheName => cacheName !== CACHE_NAME)
      .map(cacheName => caches.delete(cacheName)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const isNavigation = request.mode === "navigate" || request.destination === "document";
  const isStaticAsset = ["style", "script", "image", "font", "manifest"].includes(request.destination);

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) ||
          (await caches.match(new URL(requestUrl.pathname, self.location.origin).pathname)) ||
          (await caches.match("./offline.html"));
      }
    })());
    return;
  }

  if (isStaticAsset || requestUrl.origin === FONT_AWESOME_ORIGIN) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch {
        return Response.error();
      }
    })());
  }
});
