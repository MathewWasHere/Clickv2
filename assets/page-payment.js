/* payment page: mock ZarinPal gateway. Modes: draft (new booking) or ?b=<id> (pay pending) */
(function () {
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
  if (payBtn) payBtn.textContent = 'پرداخت ' + P.money(item.price);

  if (payBtn) payBtn.addEventListener('click', function () {
    payBtn.disabled = true;
    payBtn.textContent = 'در حال پردازش…';
    setTimeout(function () {
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
  if (cancel && item.existingId) cancel.href = 'my-bookings.html';
})();
