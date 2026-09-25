/* services page: dynamic catalog (admin-edited) + category tabs + hash deep link */
(function () {
  var sections = { main: document.getElementById('cat-main'), groom: document.getElementById('cat-groom') };
  var buttons = document.querySelectorAll('[data-cat]');

  window.showCategory = function (cat) {
    Object.keys(sections).forEach(function (k) {
      if (sections[k]) sections[k].style.display = (k === cat) ? '' : 'none';
    });
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-cat') === cat ? 'true' : 'false');
    });
  };

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { showCategory(b.getAttribute('data-cat')); });
  });

  /* ---------- dynamic cards (reflect admin price/detail edits + custom services) ---------- */
  function thumb(s) {
    if (s.img) {
      return '<div class="w-16 h-16 rounded-xl overflow-hidden shrink-0">' +
        '<img src="' + s.img + '" alt="" class="w-full h-full object-cover media-dim" /></div>';
    }
    return '<div class="w-16 h-16 rounded-xl bg-surface-3 flex items-center justify-center shrink-0">' +
      '<i data-lucide="scissors" class="w-5 h-5 text-primary"></i></div>';
  }

  function mainCard(s) {
    var el = document.createElement('a');
    el.href = 'service-detail.html?s=' + s.id;
    el.className = 'flex items-center gap-3 bg-surface rounded-2xl border border-line p-3 group elev';
    el.innerHTML =
      thumb(s) +
      '<div class="flex-1 min-w-0">' +
      '<h3 class="text-fg text-sm font-semibold mb-0.5"></h3>' +
      '<p class="text-muted text-[11px] leading-relaxed"></p>' +
      '<div class="flex items-center gap-3 mt-1.5">' +
      '<span class="text-primary text-xs font-bold price"></span>' +
      '<span class="text-faint text-[10px] flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> <span class="dur"></span></span>' +
      '</div></div>' +
      '<i data-lucide="chevron-left" class="w-4 h-4 text-faint shrink-0"></i>';
    fill(el, s);
    return el;
  }

  function groomCard(s) {
    var el = document.createElement('a');
    el.href = 'service-detail.html?s=' + s.id;
    el.className = 'block bg-surface rounded-2xl border border-primary/10 p-4 elev';
    el.innerHTML =
      '<div class="flex items-center justify-between mb-2">' +
      '<h3 class="text-fg font-bold text-sm"></h3>' +
      (s.badge ? '<span class="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-1 rounded-lg badge"></span>' : '') +
      '</div>' +
      '<p class="text-muted text-[11px] leading-relaxed mb-3"></p>' +
      '<div class="flex items-center justify-between">' +
      '<span class="text-primary font-bold text-sm price"></span>' +
      '<span class="text-faint text-[10px] flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> <span class="dur"></span></span>' +
      '</div>';
    fill(el, s);
    return el;
  }

  function fill(el, s) {
    el.querySelector('h3').textContent = s.name;
    var p = el.querySelector('p'); if (p) p.textContent = s.desc || '';
    el.querySelector('.price').textContent = P.money(s.price);
    el.querySelector('.dur').textContent = s.duration;
    var b = el.querySelector('.badge'); if (b) b.textContent = s.badge;
  }

  function render() {
    var all = P.allServices();
    var main = document.getElementById('mainList');
    var groom = document.getElementById('groomList');
    if (!main || !groom) return;
    main.innerHTML = ''; groom.innerHTML = '';
    all.forEach(function (s) {
      (s.cat === 'main' ? main : groom).appendChild(s.cat === 'main' ? mainCard(s) : groomCard(s));
    });
    if (window.lucide) lucide.createIcons();
  }

  render();
  showCategory(location.hash === '#groom' ? 'groom' : 'main');
})();
