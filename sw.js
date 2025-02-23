const VERSION = "V1";

//The list of file to cache
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

//Dispatch the resposne handle based of the type of request
async function handleResponse(e) {
  if (e.request.mode == "navigate") {
    return await handleNavigateReponse(e);
  } else {
    return await handleRessourceResponse(e);
  }
}

//Handle navigation request with preloading features
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

//Handle ressource response
async function handleRessourceResponse(e) {
  try {
    return await fetch(e.request);
  } catch (Exception) {
    const cache = await caches.open(VERSION);
    return cache.match(e.request);
  }
}

//Listen for the service worker startup
//Skip the previous worker
//Fill the cache
self.addEventListener("install", (e) => {
  self.skipWaiting();

  e.waitUntil(fillCache());
});

//Listen for the activation of the service worker
//Force claims the clients
//Clear the cache the remove previous entries
self.addEventListener("activate", (e) => {
  clients.claim();

  e.waitUntil(cleanCache());
});

//Removed other service workers caches
async function cleanCache() {
  const keys = await caches.keys();

  for (const key of keys) {
    if (key != VERSION) {
      await caches.delete(key);
    }
  }
}

//Add cached file to cache
async function fillCache() {
  const cache = await caches.open(VERSION);
  cache.addAll(CACHED);
}
