// ===== Service Worker for Offline Support =====
const CACHE_NAME = "linux-cmd-v1";

const FILES_TO_CACHE = [
  "/",
  "index.html",
  "manifest.json",
  "css/variables.css",
  "css/reset.css",
  "css/layout.css",
  "css/components.css",
  "css/quiz-modes.css",
  "js/utils.js",
  "js/data.js",
  "js/storage.js",
  "js/srs.js",
  "js/store.js",
  "js/router.js",
  "js/components/navbar.js",
  "js/components/commandCard.js",
  "js/components/flashcard3d.js",
  "js/components/progressRing.js",
  "js/screens/home.js",
  "js/screens/browse.js",
  "js/screens/quizMenu.js",
  "js/screens/flashcardQuiz.js",
  "js/screens/choiceQuiz.js",
  "js/screens/fillBlankQuiz.js",
  "js/screens/matchQuiz.js",
  "js/screens/review.js",
  "js/screens/stats.js",
  "js/app.js",
];

// Install: cache all files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE).catch((err) => {
        console.warn("SW: cache addAll failed, some files may be missing", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // Offline fallback: return the cached index.html for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
        })
      );
    })
  );
});
