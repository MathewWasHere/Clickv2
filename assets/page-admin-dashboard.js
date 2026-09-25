/* admin dashboard: live stats from stored bookings */
(function () {
  var bookings = P.store.bookings();
  var todayKey = P.dateKey(new Date());
  var paid = bookings.filter(function (b) { return b.paid; });
  var revenue = paid.reduce(function (sum, b) { return sum + b.price; }, 0);
  var commission = Math.round(revenue * 0.10);

  function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  set('statTotal', P.fa(bookings.length));
  set('statRevenue', revenue >= 1000000 ? P.fa((revenue / 1000000).toFixed(1)) + 'M' : P.fa(revenue.toLocaleString('en-US')));
  set('statNew', P.fa(bookings.filter(function (b) { return Date.now() - b.createdAt < 30 * 86400000; }).length));
  set('statToday', P.fa(bookings.filter(function (b) { return b.dateKey === todayKey && b.status !== 'cancelled'; }).length));
  set('commGross', P.money(revenue));
  set('commFee', P.money(commission));
  set('commNet', P.money(revenue - commission));

  var COLORS = ['bg-primary/10 text-primary', 'bg-blue-500/10 text-blue-400', 'bg-green-500/10 text-green-400', 'bg-purple-500/10 text-purple-400'];
  var wrap = document.getElementById('dashUpcoming');
  var upcoming = bookings
    .filter(function (b) { return b.dateKey >= todayKey && b.status !== 'cancelled'; })
    .sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; })
    .slice(0, 5);

  if (!upcoming.length) {
    wrap.innerHTML = '<div class="bg-surface rounded-xl border border-[#111111]/5 p-4 text-center text-[#111111]/30 text-xs">نوبت پیش‌رویی وجود ندارد</div>';
  }
  upcoming.forEach(function (b, i) {
    var row = document.createElement('div');
    row.className = 'bg-surface rounded-xl border border-[#111111]/5 p-3 flex items-center justify-between';
    row.innerHTML =
      '<div class="flex items-center gap-3">' +
      '<div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ' + COLORS[i % COLORS.length] + '">' + (b.customer || 'م').trim().charAt(0) + '</div>' +
      '<div><p class="text-[#111111] text-xs font-semibold"></p>' +
      '<p class="text-[#111111]/30 text-[10px]"></p></div></div>' +
      '<div class="text-left">' +
      '<p class="text-primary text-[10px] font-bold">' + P.moneyShort(b.price) + '</p>' +
      '<p class="text-[#111111]/20 text-[10px]">کمیسیون: ' + P.moneyShort(Math.round(b.price * 0.10)) + '</p>' +
      '</div>';
    var ps = row.querySelectorAll('p');
    ps[0].textContent = b.customer || 'مشتری';
    ps[1].textContent = b.name + ' — ' + b.time + ' (' + P.shortDateFa(P.fromKey(b.dateKey)) + ')';
    wrap.appendChild(row);
  });
  if (window.lucide) lucide.createIcons();
})();
