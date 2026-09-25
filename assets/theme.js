/* پیرایش — theme manager: light/dark monochrome */
(function () {
  var KEY = 'pirayesh-theme';
  var L_CANVAS = '#ECEEF0', D_CANVAS = '#0A0A0A';

  function apply(theme) {
    document.body.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? D_CANVAS : L_CANVAS);
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var initial = (saved === 'dark' || saved === 'light')
    ? saved
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  var btn;
  function setIcon(b) {
    if (!b) return;
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    b.innerHTML = isDark
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    b.title = isDark ? 'حالت روشن' : 'حالت تاریک';
  }

  function init() {
    apply(initial);
    if (window.matchMedia) {
      var mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener && mql.addEventListener('change', function (e) {
        try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
        apply(e.matches ? 'dark' : 'light'); setIcon(btn);
      });
    }
    window.addEventListener('storage', function (e) {
      if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        apply(e.newValue); setIcon(btn);
      }
    });

    btn = document.createElement('button');
    btn.setAttribute('aria-label', 'تغییر تم');
    btn.className = 'theme-btn';
    btn.addEventListener('click', function () {
      var next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      setIcon(btn);
    });
    var island = document.querySelector('header .island');
    var cal = island && island.querySelector('a[href="my-bookings.html"]');
    if (cal && cal.parentElement) cal.parentElement.insertBefore(btn, cal);
    else if (island) { btn.style.marginInlineStart = 'auto'; island.appendChild(btn); }
    else return;
    setIcon(btn);

    var st = document.createElement('style');
    st.textContent =
      '.theme-btn{width:2.25rem;height:2.25rem;border-radius:9999px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(17,17,17,0.07);color:rgba(17,17,17,0.7);flex-shrink:0;transition:background-color .15s ease,color .15s ease;}' +
      '.theme-btn:hover{background:rgba(17,17,17,0.12);color:#111;}' +
      'body[data-theme="dark"] .theme-btn{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.75);}' +
      'body[data-theme="dark"] .theme-btn:hover{background:rgba(255,255,255,0.18);color:#fff;}' +
      '.brand-logo-on-light{filter:invert(1);}body[data-theme="dark"] .brand-logo-on-light{filter:none;}' +
      '.island{background:rgba(236,238,240,0.92);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border:1px solid rgba(17,17,17,0.08);border-radius:1.25rem;box-shadow:0 10px 30px rgba(0,0,0,0.06);}' +
      'body[data-theme="dark"] .island{background:rgba(10,10,10,0.88);border-color:rgba(255,255,255,0.08);box-shadow:0 10px 30px rgba(0,0,0,0.5);}' +
      '.bottom-nav{background:transparent !important;border-top:none !important;-webkit-backdrop-filter:none;backdrop-filter:none;}' +
      'body[data-theme="dark"] .bottom-nav{background:transparent !important;border-top:none !important;}' +
      '.bottom-nav a:not(.bg-primary){color:rgba(17,17,17,0.5);}' +
      'body[data-theme="dark"] .bottom-nav a:not(.bg-primary){color:rgba(255,255,255,0.5);}' +
      '.bottom-nav a.active{background:rgba(17,17,17,0.08);color:#111;}' +
      'body[data-theme="dark"] .bottom-nav a.active{background:rgba(255,255,255,0.12);color:#fff;}';
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
