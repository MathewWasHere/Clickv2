/* =============================================================================
   پیرایش — theme controller
   -----------------------------------------------------------------------------
   The *values* live in assets/theme.css. This file only decides which mode is
   active, keeps things in sync (localStorage + <meta name="theme-color">) and
   renders the toggle button. The mode attribute itself is applied pre-paint by
   the two-line bootstrap in each page's <head>, so neither mode ever flashes.

   Modes: "light" | "dark"  ·  default: dark. A stored manual choice always wins.

   Public API (also used from the console):
     PTheme.get()            -> 'light' | 'dark'
     PTheme.set('light')     -> apply + persist
     PTheme.toggle()         -> flip
     document 'themechange'  -> CustomEvent, detail: { mode }
   ========================================================================== */
(function () {
  var KEY = 'pirayesh-theme';
  var root = document.documentElement;

  function stored() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return v === 'light' || v === 'dark' ? v : 'dark';
  }

  /* keep the browser chrome / installed-PWA status bar on the same surface colour */
  function paintChrome() {
    var bg = getComputedStyle(root).getPropertyValue('--bg').trim() ||
             (api.get() === 'dark' ? '#101315' : '#CED3D6');
    var meta = document.querySelector('meta[name="theme-color"]:not([media])') ||
               document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
    var bar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (bar) bar.setAttribute('content', api.get() === 'dark' ? 'black-translucent' : 'default');
  }

  function paintToggle(btn) {
    if (!btn) return;
    var dark = api.get() === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('title', dark ? 'حالت روشن' : 'حالت تاریک');
    btn.setAttribute('aria-label', dark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک');
  }

  function apply(mode, animate) {
    root.setAttribute('data-theme', mode === 'light' ? 'light' : 'dark');
    root.style.colorScheme = api.get();
    if (animate) {
      /* cross-fade the palette for one frame-set only (see theme.css .theme-anim) */
      root.classList.add('theme-anim');
      clearTimeout(apply._t);
      apply._t = setTimeout(function () { root.classList.remove('theme-anim'); }, 380);
    }
    paintToggle(document.getElementById('themeToggle'));
    paintChrome();
    try { document.dispatchEvent(new CustomEvent('themechange', { detail: { mode: api.get() } })); } catch (e) {}
  }

  var SUN = '<svg class="i-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42' +
    'M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var MOON = '<svg class="i-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function mount() {
    var btn = document.getElementById('themeToggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'themeToggle';
      btn.className = 'theme-btn';
      btn.innerHTML = MOON + SUN;
      btn.addEventListener('click', function () { api.toggle(); });
      /* header island on every page, next to the calendar/account icons; pages
         with no header island (hero overlays, confirmation) get the floating pill */
      var island = document.querySelector('header .island');
      if (island) {
        var anchor = island.querySelector('a[href^="my-bookings.html"], a[href^="home.html"]');
        if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(btn, anchor);
        else { btn.style.marginInlineStart = 'auto'; island.appendChild(btn); }
      } else {
        btn.classList.add('theme-btn--floating');
        document.body.appendChild(btn);
      }
    }
    paintToggle(btn);
    paintChrome();
  }

  var api = {
    get: function () { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; },
    set: function (mode, animate) {
      try { localStorage.setItem(KEY, mode === 'light' ? 'light' : 'dark'); } catch (e) {}
      apply(mode, animate !== false);
    },
    toggle: function () { api.set(api.get() === 'dark' ? 'light' : 'dark'); }
  };
  window.PTheme = api;

  /* the bootstrap already put the right mode on <html>; adopt the stored value
     in case the attribute and storage disagree (e.g. two tabs open) */
  if (stored() !== api.get()) apply(stored(), false);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply(stored(), true);
  });
})();
