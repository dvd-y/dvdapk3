/* SDVD – Service Worker: עבודה גם בלי אינטרנט */
const CACHE = 'sdvd-v4';
const FILES = [
  './', './index.html', './dai_m2.html', './recipe-book.html',
  './bible_trivia.html', './file-extension-encyclopedia.html',
  './alfey-brachot.html', './aramaic-dictionary.html', './jokes-vintage.html', './gematria.html', './currency-converter.html',
  './manifest.json', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FILES.map((f) => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* קודם הרשת (כדי שעדכונים יגיעו), ואם אין חיבור – מהמטמון */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
