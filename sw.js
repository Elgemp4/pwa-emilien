const VERSION = "V1";

const CACHED = [
  "/",
  "/index.html",
  "/output.min.css",
  "/script.js",
  "/config.js",
  "/manifest.json",
  "/icon/192.png",
  "/icon/512.png",
];

self.addEventListener("fetch", (e) => {
  e.respondWith(handleResponse(e));
});

async function handleResponse(e) {
  if (e.request.mode == "navigate") {
    return await handleNavigateReponse(e);
  } else {
    return await handleRessourceResponse(e);
  }
}

async function handleNavigateReponse(e) {
  try {
    const preloadedResponse = await e.preloadResponse();
    if (preloadedResponse) return preloadedResponse;
    return await fetch(e.request);
  } catch (Exception) {
    const cache = await caches.open(VERSION);
    return cache.match(e.request);
  }
}

async function handleRessourceResponse(e) {
  try {
    return await fetch(e.request);
  } catch (Exception) {
    const cache = await caches.open(VERSION);
    return cache.match(e.request);
  }
}

self.addEventListener("install", (e) => {
  console.log(`${VERSION} : Install`);

  self.skipWaiting();

  e.waitUntil(fillCache());
});

self.addEventListener("activate", (e) => {
  console.log(`${VERSION} : Activate`);
  clients.claim();

  e.waitUntil(cleanCache());
});

async function cleanCache() {
  const keys = await caches.keys();

  for (const key of keys) {
    if (key != VERSION) {
      await caches.delete(key);
    }
  }
}

async function fillCache() {
  const cache = await caches.open(VERSION);
  cache.addAll(CACHED);
}
