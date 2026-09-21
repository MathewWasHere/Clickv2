/* پیرایش — theme manager: light/dark with toggle in the top island navbar */
(function () {
  var KEY = 'pirayesh-theme';

  function apply(theme) {
    document.body.setAttribute('data-theme', theme);
  }

  var saved = localStorage.getItem(KEY);
  var initial = (saved === 'dark' || saved === 'light')
    ? saved
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function setIcon(btn) {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.title = isDark ? 'حالت روشن' : 'حالت تاریک';
  }

  function init() {
    apply(initial);
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(KEY)) { apply(e.matches ? 'dark' : 'light'); setIcon(btn); }
      });
    }
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', 'تغییر تم');
    btn.className = 'theme-btn';
    btn.addEventListener('click', function () {
      var next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem(KEY, next);
      setIcon(btn);
    });
    /* mount: header island on every page — next to the calendar icon when present, else at the end */
    var island = document.querySelector('header .island');
    var cal = island && island.querySelector('a[href="my-bookings.html"]');
    if (cal && cal.parentElement) cal.parentElement.insertBefore(btn, cal);
    else if (island) { btn.style.marginInlineStart = 'auto'; island.appendChild(btn); }
    else document.body.appendChild(btn);
    setIcon(btn);

    var st = document.createElement('style');
    st.textContent =
      '.theme-btn{width:2.25rem;height:2.25rem;border-radius:9999px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(39,39,39,0.06);color:rgba(39,39,39,0.6);flex-shrink:0;}' +
      'body[data-theme="dark"] .theme-btn{background:rgba(249,248,242,0.1);color:rgba(249,248,242,0.7);}' +
      /* brand logo: white PNG, auto-darkened in light mode so it never vanishes */
      '.brand-logo{filter:invert(0.85);}' +
      'body[data-theme="dark"] .brand-logo{filter:none;}' +
      /* island surfaces (floating rounded bars) */
      '.island{background:rgba(249,248,242,0.9);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border:1px solid rgba(39,39,39,0.08);border-radius:1.25rem;box-shadow:0 10px 30px rgba(0,0,0,0.08);}' +
      'body[data-theme="dark"] .island{background:rgba(30,30,30,0.9);border-color:rgba(249,248,242,0.08);}' +
      /* bottom tab bars (site + admin) */
      '.bottom-nav a{color:rgba(39,39,39,0.45);}' +
      'body[data-theme="dark"] .bottom-nav a{color:rgba(249,248,242,0.45);}' +
      '.bottom-nav a.active{background:rgba(39,39,39,0.08);color:#272727;}' +
      'body[data-theme="dark"] .bottom-nav a.active{background:rgba(249,248,242,0.12);color:#F9F8F2;}';
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
