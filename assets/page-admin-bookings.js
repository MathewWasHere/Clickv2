/* admin bookings: full list with status management */
(function () {
  var filter = 'all';
  var STATUS = {
    confirmed: { label: 'تأیید شده', cls: 'bg-ok/10 text-ok' },
    pending:   { label: 'در انتظار', cls: 'bg-warn/10 text-warn' },
    cancelled: { label: 'لغو شده', cls: 'bg-err/10 text-err' },
    done:      { label: 'انجام شده', cls: 'bg-surface-3 text-muted' }
  };
  var COLORS = ['bg-primary/10 text-primary', 'bg-info/10 text-info', 'bg-ok/10 text-ok', 'bg-violet/10 text-violet'];

  function counts() {
    var all = P.store.bookings();
    function c(f) { return all.filter(function (b) { return b.status === f; }).length; }
    document.querySelectorAll('[data-filter]').forEach(function (btn) {
      var f = btn.getAttribute('data-filter');
      var n = f === 'all' ? all.length : c(f);
      var base = btn.textContent.replace(/\s*\(.*\)$/, '');
      btn.textContent = base + ' (' + P.fa(n) + ')';
      btn.setAttribute('aria-pressed', f === filter ? 'true' : 'false');
    });
  }

  function card(b, i) {
    var st = STATUS[b.status] || STATUS.confirmed;
    var el = document.createElement('div');
    el.className = 'bg-surface rounded-xl border border-line p-4 elev';
    el.innerHTML =
      '<div class="flex items-center justify-between mb-2">' +
      '<div class="flex items-center gap-2">' +
      '<div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ' + COLORS[i % COLORS.length] + '">' + (b.customer || 'م').trim().charAt(0) + '</div>' +
      '<div><p data-customer class="text-fg text-xs font-semibold"></p><p class="text-faint text-[10px]">' + (b.phone || '') + '</p></div>' +
      '</div>' +
      '<span class="text-[10px] font-semibold px-2 py-1 rounded-lg ' + st.cls + '">' + st.label + '</span>' +
      '</div>' +
      '<div class="bg-surface-2 rounded-lg p-2.5 mb-2.5">' +
      '<div class="flex justify-between text-[10px] mb-1"><span class="text-faint">خدمت</span><span data-service class="text-fg"></span></div>' +
      '<div class="flex justify-between text-[10px] mb-1"><span class="text-faint">تاریخ</span><span class="text-fg">' + P.shortDateFa(P.fromKey(b.dateKey)) + ' — ' + b.time + '</span></div>' +
      '<div class="flex justify-between text-[10px] mb-1"><span class="text-faint">مبلغ</span><span class="text-primary font-semibold">' + P.moneyShort(b.price) + '</span></div>' +
      '<div class="flex justify-between text-[10px]"><span class="text-faint">کمیسیون ۱۰٪</span><span class="text-muted">' + P.moneyShort(Math.round(b.price * 0.10)) + '</span></div>' +
      '</div>' +
      '<div class="flex items-center justify-between">' +
      '<div class="flex items-center gap-1 text-[10px] ' + (b.paid ? 'text-ok' : 'text-warn') + '">' +
      '<i data-lucide="credit-card" class="w-3 h-3"></i> ' + (b.paid ? 'پرداخت شده' : 'پرداخت نشده') + '</div>' +
      '<select data-status class="bg-surface-3 text-muted text-[10px] px-2 py-1.5 rounded-lg outline-none">' +
      '<option value="">تغییر وضعیت</option>' +
      '<option value="confirmed">تأیید شده</option>' +
      '<option value="pending">در انتظار</option>' +
      '<option value="done">انجام شده</option>' +
      '<option value="cancelled">لغو</option>' +
      '</select></div>';
    el.querySelector('[data-customer]').textContent = b.customer || 'مشتری';
    el.querySelector('[data-service]').textContent = b.name;
    el.querySelector('[data-status]').addEventListener('change', function (e) {
      var v = e.target.value;
      if (!v) return;
      var patch = { status: v };
      if (v === 'confirmed') patch.paid = true;
      P.store.updateBooking(b.id, patch);
      P.toast('وضعیت «' + b.name + '» به‌روزرسانی شد');
      render();
    });
    return el;
  }

  function render() {
    counts();
    var list = document.getElementById('adminList');
    list.innerHTML = '';
    var items = P.store.bookings().filter(function (b) {
      return filter === 'all' || b.status === filter;
    });
    if (!items.length) {
      list.innerHTML = '<div class="bg-surface rounded-xl border border-line p-6 text-center text-faint text-xs elev">موردی یافت نشد</div>';
    }
    items.forEach(function (b, i) { list.appendChild(card(b, i)); });
    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter = btn.getAttribute('data-filter');
      render();
    });
  });

  render();
})();
