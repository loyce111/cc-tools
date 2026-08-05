// OSINT Toolkit Service Worker — 离线缓存 + PWA 支持
const CACHE = 'osint-toolkit-v1';
const ASSETS = [
  './osint-toolkit.html',
  './osint-icon.svg',
  './osint-manifest.json'
];

// 安装时预缓存
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// 请求：缓存优先 + 网络回退
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      let fetched = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          let clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
