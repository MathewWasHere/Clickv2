/* my-bookings page: list real bookings, tabs, cancel, pay pending */
(function () {
  var tab = 'upcoming';
  var todayKey = P.dateKey(new Date());

  var STATUS = {
    confirmed: { label: 'تأیید شده', cls: 'bg-ok/10 text-ok' },
    pending:   { label: 'در انتظار پرداخت', cls: 'bg-warn/10 text-warn' },
    cancelled: { label: 'لغو شده', cls: 'bg-err/10 text-err' },
    done:      { label: 'انجام شده', cls: 'bg-surface-3 text-muted' }
  };

  function card(b) {
    var st = STATUS[b.status] || STATUS.confirmed;
    var past = b.dateKey < todayKey || b.status === 'done';
    var el = document.createElement('div');
    el.className = 'bg-surface rounded-2xl border p-4 elev ' + (past ? 'border-line opacity-60' : (b.status === 'confirmed' ? 'border-primary/20' : 'border-line'));
    el.innerHTML =
      '<div class="flex items-center justify-between mb-3">' +
      '<span class="text-[10px] font-semibold px-2.5 py-1 rounded-lg ' + st.cls + '">' + st.label + '</span>' +
      '<span class="text-faint text-[10px]" dir="ltr">' + P.fa(b.id) + '</span>' +
      '</div>' +
      '<h3 class="text-fg font-bold text-sm mb-1"></h3>' +
      '<div class="flex items-center gap-4 text-xs text-muted mb-3">' +
      '<span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ' + P.fullDateFa(P.fromKey(b.dateKey)) + '</span>' +
      '<span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ' + b.time + '</span>' +
      '</div>' +
      '<div class="flex items-center justify-between">' +
      '<span class="text-primary font-bold text-sm">' + P.money(b.price) + '</span>' +
      '<div class="flex gap-2" data-actions></div>' +
      '</div>';
    el.querySelector('h3').textContent = b.name;

    var actions = el.querySelector('[data-actions]');
    if (b.status === 'pending') {
      var pay = document.createElement('a');
      pay.href = 'payment.html?b=' + encodeURIComponent(b.id);
      pay.className = 'bg-primary text-on-primary text-[10px] font-bold px-4 py-1.5 rounded-lg';
      pay.textContent = 'پرداخت';
      actions.appendChild(pay);
      var c1 = mkCancel(b, actions);
    } else if (b.status === 'confirmed') {
      mkCancel(b, actions);
    }
    return el;
  }

  function mkCancel(b, actions) {
    var btn = document.createElement('button');
    btn.className = 'bg-surface-3 text-muted text-[10px] px-3 py-1.5 rounded-lg';
    btn.textContent = 'لغو';
    btn.addEventListener('click', function () {
      if (confirm('این رزرو لغو شود؟')) {
        P.store.updateBooking(b.id, { status: 'cancelled' });
        render();
        P.toast('رزرو لغو شد');
      }
    });
    actions.appendChild(btn);
    return btn;
  }

  function render() {
    var list = document.getElementById('bookingsList');
    list.innerHTML = '';
    var items = P.store.bookings().filter(function (b) {
      var past = b.dateKey < todayKey || b.status === 'done';
      return tab === 'upcoming' ? !past : past;
    });
    if (!items.length) {
      list.innerHTML = '<div class="bg-surface rounded-2xl border border-line p-8 text-center elev">' +
        '<i data-lucide="calendar-x" class="w-8 h-8 text-faint mx-auto mb-3"></i>' +
        '<p class="text-muted text-xs mb-4">هنوز رزروی در این بخش ندارید</p>' +
        '<a href="booking.html" class="inline-block bg-primary text-on-primary text-xs font-bold px-5 py-2.5 rounded-xl">+ رزرو جدید</a></div>';
    } else {
      items.forEach(function (b) { list.appendChild(card(b)); });
    }
    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      tab = btn.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(function (b2) {
        b2.setAttribute('aria-pressed', b2 === btn ? 'true' : 'false');
      });
      render();
    });
  });

  render();
})();
