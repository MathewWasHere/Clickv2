/* پیرایش — PWA: service worker registration + install banner */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    var banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'flex';
  });

  window.addEventListener('appinstalled', function () {
    var banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'none';
    if (window.P && P.toast) P.toast('پیرایش نصب شد');
  });

  function wireInstall() {
    var btn = document.getElementById('installBtn');
    if (btn) btn.addEventListener('click', function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () {
          deferred = null;
          var banner = document.getElementById('installBanner');
          if (banner) banner.style.display = 'none';
        });
      } else {
        var banner = document.getElementById('installBanner');
        if (banner) banner.style.display = 'none';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireInstall);
  else wireInstall();
})();
