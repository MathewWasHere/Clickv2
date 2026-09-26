/* پیرایش PWA service worker */
var CACHE = 'pirayesh-v36-smaller-hero-star';
var SHELL = [
  './', 'index.html', 'home.html', 'login.html', 'terms.html', 'assets/auth.js', 'assets/page-login.js', 'assets/profile-details.js',
  'services.html', 'service-detail.html',
  'booking.html', 'payment.html', 'confirmation.html', 'my-bookings.html',
  'profile.html', 'admin-dashboard.html', 'admin-bookings.html',
  'admin-services.html', 'admin-settings.html',
  'manifest.webmanifest',
  'assets/logo-white.png',
  'assets/services/vip.jpg', 'assets/services/facial.jpg', 'assets/services/makeup.jpg', 'assets/services/keratin.jpg', 'assets/services/groom1.jpg', 'assets/services/groom2.jpg', 'assets/services/groom3.jpg', 'assets/services/groom4.jpg',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-maskable-512.png',
  'assets/dark.css', 'assets/admin.css', 'assets/data.js', 'assets/theme.js', 'assets/pwa.js',
  'assets/page-services.js', 'assets/page-service-detail.js', 'assets/page-booking.js',
  'assets/page-payment.js', 'assets/page-confirmation.js', 'assets/page-my-bookings.js',
  'assets/page-profile.js', 'assets/page-admin-dashboard.js', 'assets/customer-club.js', 'assets/page-customer-club.js',
  'assets/page-admin-bookings.js', 'assets/page-admin-services.js', 'assets/page-admin-settings.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // Navigations: network first, fall back to cached shell (offline support)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('home.html'); });
      })
    );
    return;
  }

  // Everything else (assets, CDN, images): network-first with cache fallback
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
