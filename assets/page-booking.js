/* booking page: service + Jalali date + time selection → draft → payment */
(function () {
  var state = { serviceId: null, dateKey: null, time: null };
  var draft = P.store.draft();
  var params = new URLSearchParams(location.search);
  var preset = params.get('s');
  if (preset && P.findService(preset)) state.serviceId = preset;
  else if (draft && draft.serviceId && P.findService(draft.serviceId)) state.serviceId = draft.serviceId;
  else state.serviceId = 'groom3';

  /* ---------- calendar data ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var days = [];
  for (var i = -40; i <= 100; i++) {
    var d = P.addDays(today, i);
    days.push({ date: d, key: P.dateKey(d), j: P.jparts(d) });
  }
  var months = [];
  days.forEach(function (day) {
    var k = day.j.jy + '|' + day.j.jm;
    if (!months.some(function (m) { return m.k === k; })) months.push({ k: k, label: day.j.jm + ' ' + P.fa(day.j.jy) });
  });
  var miMin = months.findIndex(function (m) {
    var t = P.jparts(today);
    return m.k === (t.jy + '|' + t.jm);
  });
  if (miMin < 0) miMin = 0;
  var mi = miMin;

  /* ---------- services list ---------- */
  function renderServices() {
    var wrap = document.getElementById('serviceList');
    if (!wrap) return;
    wrap.innerHTML = '';
    P.allServices().forEach(function (s) {
      var sel = s.id === state.serviceId;
      var el = document.createElement('div');
      el.className = 'bg-surface rounded-xl border p-3 flex items-center justify-between cursor-pointer transition-colors ' +
        (sel ? 'border-primary border-2' : 'border-[#272727]/5 hover:border-primary/30');
      el.innerHTML =
        '<div class="min-w-0">' +
        '<h4 class="text-[#272727] text-xs font-semibold mb-0.5"></h4>' +
        '<span class="text-[#272727]/30 text-[10px]"></span>' +
        '</div>' +
        '<div class="w-5 h-5 rounded-full border shrink-0 mr-2 flex items-center justify-center ' +
        (sel ? 'bg-primary border-primary' : 'border-[#272727]/20') + '">' +
        (sel ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F9F8F2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
        '</div>';
      el.querySelector('h4').textContent = s.name;
      el.querySelector('span').textContent = P.money(s.price) + ' — ' + s.duration;
      el.addEventListener('click', function () { state.serviceId = s.id; renderServices(); update(); });
      wrap.appendChild(el);
    });
  }

  /* ---------- calendar ---------- */
  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  function renderCalendar() {
    var month = months[mi];
    var title = document.getElementById('calTitle');
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    if (title) title.textContent = month.label;

    var monthDays = days.filter(function (d) { return (d.j.jy + '|' + d.j.jm) === month.k; });
    grid.innerHTML = '';
    if (monthDays.length) {
      var lead = P.weekIndex(monthDays[0].date);
      for (var e = 0; e < lead; e++) grid.appendChild(document.createElement('div'));
    }
    monthDays.forEach(function (day) {
      var cell = document.createElement('div');
      var disabled = P.isFriday(day.date) || day.date < today;
      var cls = 'cal-day rounded-xl text-center py-2.5 text-xs ';
      if (disabled) cls += 'disabled text-[#272727]/50';
      else if (day.key === state.dateKey) cls += 'selected font-bold';
      else if (day.key === P.dateKey(today)) cls += 'today text-[#272727] font-semibold';
      else cls += 'text-[#272727]/70';
      cell.className = cls;
      cell.textContent = P.fa(day.j.jd);
      if (!disabled) {
        cell.addEventListener('click', function () {
          state.dateKey = day.key; state.time = null;
          renderCalendar(); renderTimes(); update();
        });
      }
      grid.appendChild(cell);
    });

    var prev = document.getElementById('calPrev'), next = document.getElementById('calNext');
    if (prev) prev.disabled = mi <= miMin;
    if (next) next.disabled = mi >= months.length - 1;
    [prev, next].forEach(function (b) { if (b) b.style.opacity = b.disabled ? '.3' : '1'; });

    var row = document.getElementById('selDateText');
    if (row) {
      if (state.dateKey) row.textContent = P.shortDateFa(P.fromKey(state.dateKey)) + ' — ' + P.jparts(P.fromKey(state.dateKey)).weekday;
      else row.textContent = 'هنوز تاریخی انتخاب نشده';
    }
  }

  /* ---------- time slots ---------- */
  function renderTimes() {
    var grid = document.getElementById('timeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!state.dateKey) {
      grid.innerHTML = '<p class="col-span-3 text-center text-[#272727]/30 text-[11px] py-4">ابتدا تاریخ را انتخاب کنید</p>';
      return;
    }
    var isToday = state.dateKey === P.dateKey(today);
    var now = new Date();
    var taken = [];
    P.store.bookings().forEach(function (b) {
      if (b.dateKey === state.dateKey && b.status !== 'cancelled') taken.push(b.time);
    });
    for (var h = 9; h < 21; h++) {
      for (var m = 0; m < 60; m += 30) {
        var t = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        var busy = hash(state.dateKey + t) % 4 === 0 || taken.indexOf(P.fa(t)) > -1;
        var past = isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()));
        var slot = document.createElement('div');
        var cls = 'time-slot bg-surface rounded-xl border text-center py-3 text-xs ';
        if (busy || past) cls += 'disabled border-[#272727]/5 text-[#272727]/50';
        else if (state.time === t) cls += 'selected border-primary text-primary font-semibold cursor-pointer';
        else cls += 'border-[#272727]/5 text-[#272727]/70 cursor-pointer';
        slot.className = cls;
        slot.textContent = P.fa(t);
        if (!busy && !past) {
          slot.addEventListener('click', function () {
            state.time = t; renderTimes(); update();
          });
        }
        grid.appendChild(slot);
      }
    }
  }

  /* ---------- summary & steps ---------- */
  function update() {
    var s = P.findService(state.serviceId);
    function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
    set('sumService', s ? s.name : '—');
    set('sumDate', state.dateKey ? P.fullDateFa(P.fromKey(state.dateKey)) : '—');
    set('sumTime', state.time ? P.fa(state.time) : '—');
    set('sumDuration', s ? s.duration : '—');
    set('sumPrice', s ? P.money(s.price) : '—');

    function step(id, done) {
      var el = document.getElementById(id);
      if (!el) return;
      el.className = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ' + (done ? 'step-done' : 'step-pending');
    }
    step('step2', !!state.dateKey);
    step('step3', !!state.time);
    step('step4', !!(state.serviceId && state.dateKey && state.time));

    var btn = document.getElementById('ctaBtn');
    if (btn) {
      var ready = !!(state.serviceId && state.dateKey && state.time);
      btn.disabled = !ready;
      btn.style.opacity = ready ? '1' : '.45';
    }
  }

  document.getElementById('calPrev').addEventListener('click', function () { if (mi > miMin) { mi--; renderCalendar(); } });
  document.getElementById('calNext').addEventListener('click', function () { if (mi < months.length - 1) { mi++; renderCalendar(); } });

  var cta = document.getElementById('ctaBtn');
  if (cta) cta.addEventListener('click', function () {
    var s = P.findService(state.serviceId);
    P.store.saveDraft({
      serviceId: state.serviceId, name: s.name, price: s.price, duration: s.duration,
      dateKey: state.dateKey, time: P.fa(state.time)
    });
    location.href = 'payment.html';
  });

  renderServices(); renderCalendar(); renderTimes(); update();
})();
