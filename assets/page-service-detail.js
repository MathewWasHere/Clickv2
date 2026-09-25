/* service-detail page: render service from ?s= */
(function () {
  var params = new URLSearchParams(location.search);
  var s = P.findService(params.get('s')) || P.service('groom3');
  if (!s) { location.replace('services.html'); return; }

  var ICONS = ['scissors', 'pen-tool', 'sparkles', 'layers', 'palette', 'scan-face', 'droplets', 'crown', 'star', 'gem'];

  function set(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

  var img = document.getElementById('sd-img');
  if (img && s.img) { img.src = s.img; img.alt = s.name; }

  var badge = document.getElementById('sd-badge');
  if (badge) {
    if (s.badge) badge.textContent = s.badge;
    else badge.style.display = 'none';
  }

  set('sd-title', s.name);
  set('sd-desc', s.desc || '');
  set('sd-price', P.fa(s.price.toLocaleString('en-US')).replace(/,/g, '٬'));
  set('sd-duration', s.duration);

  var inc = document.getElementById('sd-includes');
  if (inc && s.includes) {
    inc.innerHTML = '';
    s.includes.forEach(function (item, i) {
      var row = document.createElement('div');
      row.className = 'flex items-center gap-3 bg-surface rounded-xl p-3';
      row.innerHTML =
        '<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">' +
        '<i data-lucide="' + ICONS[i % ICONS.length] + '" class="w-4 h-4 text-primary"></i></div>' +
        '<span class="text-fg/85 text-xs"></span>';
      row.lastElementChild.textContent = item;
      inc.appendChild(row);
    });
  }

  set('sd-price2', P.money(s.price));
  var book = document.getElementById('sd-book');
  if (book) book.href = 'booking.html?s=' + encodeURIComponent(s.id);

  document.title = s.name + ' — پیرایش کلیک';
  if (window.lucide) lucide.createIcons();
})();
