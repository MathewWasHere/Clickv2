/* payment page: mock ZarinPal gateway. Modes: draft (new booking) or ?b=<id> (pay pending) */
(function () {
  var returnTo = 'payment.html' + location.search + location.hash;
  // Do not render/attach payment handlers while the head guard is redirecting.
  if (!P.auth.requireLogin(returnTo)) return;
  var checkoutPhone = P.auth.session().phone;
  function canPay() {
    if (!P.auth.requireLogin(returnTo)) return false;
    if (P.auth.session().phone !== checkoutPhone) { location.reload(); return false; }
    return true;
  }
  var params = new URLSearchParams(location.search);
  var pendingId = params.get('b');
  var item = null; /* {serviceId,name,price,dateKey,time, existingId?} */

  if (pendingId) {
    var b = P.store.booking(pendingId);
    if (b && b.status === 'pending') item = { existingId: b.id, serviceId: b.serviceId, name: b.name, price: b.price, dateKey: b.dateKey, time: b.time };
  }
  if (!item) {
    var draft = P.store.draft();
    if (!draft) { location.replace('booking.html'); return; }
    item = draft;
  }

  function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  var orderCode = item.existingId || ('PRE-' + Math.floor(1000 + Math.random() * 9000));

  set('payService', item.name);
  set('payDate', P.fullDateFa(P.fromKey(item.dateKey)));
  set('payTime', item.time);
  set('payTotal', P.money(item.price));
  set('payAmount', P.money(item.price));
  set('payOrder', P.fa(orderCode));
  var payBtn = document.getElementById('payBtn');

  if (payBtn) payBtn.addEventListener('click', function () {
    if (!canPay()) return;
    payBtn.disabled = true;
    payBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i><span class="text-base">در حال انتقال به درگاه…</span>';
    if (window.lucide) lucide.createIcons();
    setTimeout(function () {
      if (!canPay()) return;
      var id;
      if (item.existingId) {
        id = item.existingId;
        P.store.updateBooking(id, { status: 'confirmed', paid: true });
      } else {
        var prof = P.store.profile();
        id = P.store.nextCode();
        P.store.addBooking({
          id: id, serviceId: item.serviceId, name: item.name, price: item.price,
          dateKey: item.dateKey, time: item.time, status: 'confirmed', paid: true,
          customer: prof.name, phone: prof.phone, createdAt: Date.now()
        });
        P.store.clearDraft();
      }
      localStorage.setItem('pirayesh-last-booking', id);
      location.href = 'confirmation.html?id=' + encodeURIComponent(id);
    }, 900);
  });

  var cancel = document.getElementById('cancelPay');
  if (cancel) cancel.href = item.existingId ? 'my-bookings.html' : 'booking.html#step3';
})();
