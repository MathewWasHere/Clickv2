/* پیرایش — theme manager: light/dark with floating toggle */
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
    btn.style.cssText = 'position:fixed;bottom:20px;left:16px;z-index:60;width:40px;height:40px;border-radius:999px;border:1px solid rgba(39,39,39,.15);background:#fff;color:#272727;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.12);';
    btn.addEventListener('click', function () {
      var next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem(KEY, next);
      setIcon(btn);
    });
    document.body.appendChild(btn);
    setIcon(btn);

    /* dark-theme tweaks for the floating button itself */
    var st = document.createElement('style');
    st.textContent = 'body[data-theme="dark"] button[aria-label="تغییر تم"]{background:#F9F8F2;color:#272727;border-color:#F9F8F2;}';
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
