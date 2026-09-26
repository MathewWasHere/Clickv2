/* Admin dashboard customer club: browse, filter and export customer records. */
(function () {
  if (!P.auth.isAdmin() || P.auth.needsTerms() || P.auth.needsProfile()) return;
  var search = document.getElementById('clubSearch');
  var month = document.getElementById('clubBirthMonth');
  var list = document.getElementById('clubMembers');
  var more = document.getElementById('clubLoadMore');
  var exportButton = document.getElementById('clubExport');
  var status = document.getElementById('clubExportStatus');
  var limit = 10;
  var dateFormat = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'Asia/Tehran' });

  function filters() { return { query: search.value, month: month.value }; }
  function node(tag, className, text) {
    var el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function date(value) { return value ? dateFormat.format(new Date(value)) : 'ثبت نشده'; }
  function card(member) {
    var item = node('article', 'bg-canvas border border-[#111111]/5 rounded-xl p-3 space-y-2');
    item.appendChild(node('h3', 'text-[#111111] font-semibold text-sm break-words', member.name));
    var phone = node('a', 'inline-block text-primary text-sm font-semibold py-1', P.fa(member.phone));
    phone.dir = 'ltr';
    phone.href = 'tel:+98' + member.phone.slice(1);
    item.appendChild(phone);
    item.appendChild(node('p', 'text-[#111111]/70 text-xs', 'تولد (شمسی): ' +
      (member.birthDate ? P.fa(member.birthDate.replace(/-/g, '/')) : 'ثبت نشده')));
    item.appendChild(node('p', 'text-[#111111]/60 text-[11px]', 'عضویت: ' + date(member.createdAt)));
    return item;
  }

  function render() {
    var all = P.store.customers();
    var selected = P.customerClub.members(filters());
    document.getElementById('clubTotal').textContent = P.fa(all.length);
    var currentMonth = +new Intl.DateTimeFormat('en-US-u-ca-persian', { month: 'numeric', timeZone: 'Asia/Tehran' }).format(new Date());
    document.getElementById('clubBirthdays').textContent = P.fa(all.filter(function (member) {
      return +member.birthDate.split('-')[1] === currentMonth;
    }).length);
    document.getElementById('statNew').textContent = P.fa(all.filter(function (member) {
      var age = Date.now() - Date.parse(member.createdAt);
      return age >= 0 && age < 30 * 86400000;
    }).length);
    list.textContent = '';
    selected.slice(0, limit).forEach(function (member) { list.appendChild(card(member)); });
    document.getElementById('clubResults').textContent = P.fa(selected.length) + ' عضو یافت شد';
    var empty = document.getElementById('clubEmpty');
    empty.hidden = selected.length !== 0;
    empty.textContent = all.length ? 'عضوی با این فیلترها پیدا نشد.' : 'هنوز کاربری اطلاعات خود را ثبت نکرده است.';
    more.hidden = selected.length <= limit;
    exportButton.disabled = !selected.length;
    exportButton.textContent = 'خروجی CSV مشتریان (' + P.fa(selected.length) + ')';
    status.hidden = true;
  }
  function reset() { limit = 10; render(); }
  search.addEventListener('input', reset);
  month.addEventListener('change', reset);
  more.addEventListener('click', function () { limit += 10; render(); });
  exportButton.addEventListener('click', function () {
    try {
      var csv = P.customerClub.csv(filters());
      if (!csv) { render(); return; }
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      var link = document.createElement('a');
      link.href = url;
      link.download = 'customer-club-' + P.dateKey(new Date()) + '.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      status.textContent = 'فایل آماده شد. شماره‌های CSV را در اکسل به‌صورت متن وارد کنید تا صفر اول حفظ شود.';
    } catch (e) { status.textContent = 'ساخت فایل ممکن نشد. لطفاً دوباره تلاش کنید.'; }
    status.hidden = false;
  });
  window.addEventListener('storage', function (event) {
    if (event.key === null || event.key === 'pirayesh-profile' ||
        event.key.indexOf('pirayesh-profile:') === 0) render();
  });
  window.addEventListener('pageshow', render);
  render();
})();
