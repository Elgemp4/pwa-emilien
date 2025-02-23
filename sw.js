const VERSION = "V2";

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
  e.respondWith(handleFetchReponse(e));
});

async function handleFetchReponse(e) {
  try {
    const preloadedResponse = await e.preloadResponse();
    if (preloadedResponse) return preloadedResponse;

    return await fetch(e.request);
  } catch (Exception) {
    const cache = await caches.open(VERSION);
    return cache.match(e.request);
  }
}

self.addEventListener("install", (e) => {
  console.log(`${VERSION} : Install`);

  self.skipWaiting();

  self.waitUntil(fillCache());
});

self.addEventListener("activate", (e) => {
  console.log(`${VERSION} : Activate`);
  clients.claim();

  self.waitUntil(cleanCache());
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
