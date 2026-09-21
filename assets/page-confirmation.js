/* confirmation page: shows the booking that was just paid */
(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get('id') || localStorage.getItem('pirayesh-last-booking');
  var b = id ? P.store.booking(id) : null;
  if (!b) { location.replace('home.html'); return; }

  var svc = P.findService(b.serviceId);
  function set(el, v) { if (el) el.textContent = v; }
  set(document.getElementById('confCode'), P.fa(b.id));
  set(document.getElementById('confService'), b.name);
  set(document.getElementById('confDate'), P.fullDateFa(P.fromKey(b.dateKey)));
  set(document.getElementById('confTime'), b.time);
  set(document.getElementById('confDuration'), svc ? svc.duration : '—');
  set(document.getElementById('confPrice'), P.money(b.price));
})();
