/* booking page — 3-stage wizard: خدمت → تاریخ → ساعت  (ui-ux-pro-max:
   progress indicators, predictable back, inline validation, submit feedback,
   reduced-motion respect) */
(function () {
  var state = { serviceId: null, dateKey: null, time: null };
  var stage = 1;
  var today = new Date(); today.setHours(0, 0, 0, 0);

  /* ---------- preset & draft restore ---------- */
  var draft = P.store.draft();
  var params = new URLSearchParams(location.search);
  var preset = params.get('s');
  if (preset && P.findService(preset)) state.serviceId = preset;
  else if (draft && draft.serviceId && P.findService(draft.serviceId)) state.serviceId = draft.serviceId;
  else state.serviceId = 'groom3';
  if (draft && draft.dateKey) state.dateKey = draft.dateKey;
  if (draft && draft.time) state.time = P.toEnDigits(draft.time);

  /* ---------- calendar data: only today + 10 days ahead (11 days total) ---------- */
  var WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  var days = [];
  for (var i = 0; i <= 10; i++) {
    var d = P.addDays(today, i);
    var jp = P.jparts(d);
    days.push({
      date: d,
      key: P.dateKey(d),
      j: jp,
      dayNum: jp.jd,
      monthLabel: jp.jm,
      weekday: i === 0 ? 'امروز' : WEEKDAYS[P.weekIndex(d)]
    });
  }

  function $(id) { return document.getElementById(id); }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  /* ---------- stage 1: services ---------- */
  function renderServices() {
    var wrap = $('serviceList');
    if (!wrap) return;
    wrap.innerHTML = '';
    P.allServices().forEach(function (s) {
      var sel = s.id === state.serviceId;
      var el = document.createElement('div');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.className = 'bg-surface rounded-xl border p-2.5 cursor-pointer transition-colors flex flex-col justify-between gap-1.5 ' +
        (sel ? 'border-primary border-2' : 'border-[#111111]/5 hover:border-primary/30');
      el.innerHTML =
        '<div class="flex items-start justify-between gap-1">' +
        '<h4 class="text-[#111111] text-[11px] font-semibold leading-snug"></h4>' +
        '<div class="w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ' +
        (sel ? 'bg-primary border-primary text-on-primary' : 'border-[#111111]/20') + '">' +
        (sel ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
        '</div></div>' +
        '<div class="flex items-center justify-between">' +
        '<span class="text-primary text-[10px] font-bold"></span>' +
        '<span class="text-[#111111]/30 text-[9px]"></span>' +
        '</div>';
      el.querySelector('h4').textContent = s.name;
      el.querySelector('span.text-primary, span.font-bold').textContent = P.moneyShort(s.price);
      el.querySelectorAll('span')[el.querySelectorAll('span').length - 1].textContent = s.duration;
      function pick() { state.serviceId = s.id; renderServices(); update(); }
      el.addEventListener('click', pick);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      wrap.appendChild(el);
    });
  }

  /* ---------- stage 2: 6-col grid — all 11 days visible at once ---------- */
  function renderCalendar() {
    var grid = $('dayScroller');
    if (!grid) return;
    grid.innerHTML = '';
    days.forEach(function (day) {
      var disabled = P.isFriday(day.date);
      var sel = day.key === state.dateKey;
      var isToday = day.key === P.dateKey(today);
      var cell = document.createElement('div');
      var cls = 'rounded-xl border flex flex-col items-center justify-center py-2 gap-0.5 text-center cursor-pointer transition-colors ';
      if (disabled) {
        cls += 'border-[#111111]/5 bg-[#111111]/[0.02] text-[#111111]/30 cursor-not-allowed';
      } else if (sel) {
        cls += 'border-primary bg-primary text-on-primary';
      } else {
        cls += 'border-[#111111]/10 bg-surface text-[#111111]/80 hover:border-primary/40';
      }
      cell.className = cls;
      cell.innerHTML =
        '<span class="text-[10px] ' + (sel ? 'text-on-primary/80' : (disabled ? 'text-[#111111]/30' : 'text-[#111111]/50')) + '">' + day.weekday + '</span>' +
        '<span class="text-lg font-black leading-none ' + (sel ? 'text-on-primary' : 'text-[#111111]') + '">' + P.fa(day.dayNum) + '</span>' +
        '<span class="text-[9px] ' + (sel ? 'text-on-primary/80' : (disabled ? 'text-[#111111]/30' : (isToday ? 'text-primary font-bold' : 'text-[#111111]/40'))) + '">' + day.monthLabel + '</span>';
      if (!disabled) {
        cell.addEventListener('click', function () {
          state.dateKey = day.key; state.time = null;
          renderCalendar(); renderTimes(); update();
        });
      }
      grid.appendChild(cell);
    });
  }

  /* ---------- stage 3: time slots ---------- */
  function renderTimes() {
    var grid = $('timeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!state.dateKey) {
      grid.innerHTML = '<p class="col-span-3 text-center text-[#111111]/30 text-[11px] py-4">ابتدا تاریخ را انتخاب کنید</p>';
      return;
    }
    var isToday = state.dateKey === P.dateKey(today);
    var now = new Date();
    var taken = [];
    P.store.bookings().forEach(function (b) {
      if (b.dateKey === state.dateKey && b.status !== 'cancelled') taken.push(b.time);
    });
    for (let h = 9; h < 21; h++) {
      for (let m = 0; m < 60; m += 30) {
        const t = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        var busy = hash(state.dateKey + t) % 4 === 0 || taken.indexOf(P.fa(t)) > -1;
        var past = isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()));
        var slot = document.createElement('div');
        var cls = 'time-slot bg-surface rounded-lg border text-center py-2 text-[11px] ';
        if (busy || past) cls += 'disabled border-[#111111]/5 text-[#111111]/50';
        else if (state.time === t) cls += 'selected border-primary text-primary font-semibold cursor-pointer';
        else cls += 'border-[#111111]/5 text-[#111111]/70 cursor-pointer';
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

  /* ---------- stage machine ---------- */
  var STAGES = ['stepService', 'stepDate', 'stepTime'];
  var HINTS = { 1: 'ابتدا یک خدمت انتخاب کنید', 2: 'ابتدا تاریخ را انتخاب کنید', 3: 'ابتدا ساعت را انتخاب کنید' };
  var LABELS = { 1: 'ادامه', 2: 'ادامه', 3: 'تأیید و پرداخت' };

  function canNext(st) {
    if (st === 1) return !!state.serviceId;
    if (st === 2) return !!state.dateKey;
    return !!state.time;
  }

  function show(n, push) {
    stage = n;
    STAGES.forEach(function (id, idx) {
      var el = $(id);
      if (!el) return;
      var on = (idx + 1) === n;
      el.style.display = on ? '' : 'none';
      el.classList.remove('stage');
      if (on) { void el.offsetWidth; el.classList.add('stage'); }
    });
    for (var i = 1; i <= 3; i++) {
      var dot = $('stepDot' + i), label = $('stepLabel' + i), wrap = $('stepWrap' + i);
      if (!dot) continue;
      var cls = 'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold step-dot ';
      if (i < n) cls += 'step-done';
      else if (i === n) cls += 'step-active';
      else cls += 'step-pending';
      dot.className = cls;
      dot.innerHTML = i < n ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : P.fa(i);
      if (label) label.className = 'text-[10px] ' + (i === n ? 'text-primary font-medium' : i < n ? 'text-[#111111]/60' : 'text-[#111111]/30');
      if (wrap) wrap.style.cursor = i < n ? 'pointer' : 'default';
    }
    var back = $('backBtn');
    if (back) back.style.display = n > 1 ? 'flex' : 'none';
    update();
    if (n === 2) renderCalendar();
    if (n === 3) { renderTimes(); update(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (push && history.pushState) history.pushState({ step: n }, '', '#step' + n);
  }

  function update() {
    var s = P.findService(state.serviceId);
    function set(id, v) { var el = $(id); if (el) el.textContent = v; }
    set('sumService', s ? s.name : '—');
    set('sumDate', state.dateKey ? P.fullDateFa(P.fromKey(state.dateKey)) : '—');
    set('sumTime', state.time ? P.fa(state.time) : '—');
    set('sumDuration', s ? s.duration : '—');
    set('sumPrice', s ? P.money(s.price) : '—');

    var btn = $('ctaBtn'), lbl = $('ctaLabel');
    if (lbl) lbl.textContent = LABELS[stage];
    if (btn) {
      btn.style.opacity = canNext(stage) ? '1' : '.55';
      btn.setAttribute('aria-disabled', canNext(stage) ? 'false' : 'true');
    }
  }

  /* ---------- actions ---------- */
  var cta = $('ctaBtn');
  if (cta) cta.addEventListener('click', function () {
    if (!canNext(stage)) { P.toast(HINTS[stage]); return; }
    if (stage < 3) { show(stage + 1, true); return; }
    // Save the complete selection BEFORE login. No booking/payment is created here.
    var s = P.findService(state.serviceId);
    if (!s) { P.toast('لطفاً یک خدمت معتبر انتخاب کنید.'); return; }
    try {
      P.store.saveDraft({
        serviceId: state.serviceId, name: s.name, price: s.price, duration: s.duration,
        dateKey: state.dateKey, time: P.fa(state.time)
      });
    } catch (e) {
      P.toast('ذخیره انتخاب‌ها ممکن نیست. ذخیره‌سازی مرورگر را بررسی کنید و دوباره تلاش کنید.');
      return;
    }
    cta.disabled = true;
    cta.style.opacity = '.7';
    if ($('ctaLabel')) $('ctaLabel').textContent = 'در حال ادامه…';
    setTimeout(function () {
      // Guests authenticate only at this final handoff; completed sessions skip login.
      if (P.auth.requireLogin('payment.html')) location.href = 'payment.html';
    }, 450);
  });

  var back = $('backBtn');
  if (back) back.addEventListener('click', function () { if (stage > 1) show(stage - 1, true); });

  [1, 2, 3].forEach(function (n) {
    var wrap = $('stepWrap' + n);
    if (wrap) wrap.addEventListener('click', function () { if (n < stage) show(n, true); });
  });

  /* predictable back: browser back returns to the previous stage */
  window.addEventListener('popstate', function (e) {
    var n = (e.state && e.state.step) || 1;
    if (n !== stage && n >= 1 && n <= 3) show(n, false);
  });

  // Browser Back can restore the page from before its checkout redirect.
  window.addEventListener('pageshow', function () {
    if (cta) cta.disabled = false;
    update();
  });

  /* ---------- init ---------- */
  renderServices(); renderCalendar(); renderTimes();
  var initial = 1;
  var m = (location.hash || '').match(/step([123])/);
  if (m) {
    var want = +m[1];
    if (want === 2 && state.serviceId) initial = 2;
    else if (want === 3 && state.serviceId && state.dateKey) initial = 3;
  }
  show(initial, false);
})();
