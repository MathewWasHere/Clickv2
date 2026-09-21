/* admin services: list catalog + custom services, add via modal, delete custom */
(function () {
  function faDigitsToEn(str) {
    return String(str).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); });
  }

  function card(s) {
    var el = document.createElement('div');
    el.className = 'bg-surface rounded-xl border p-3';
    el.classList.add(s.badge === 'محبوب‌ترین' ? 'border-primary/15' : 'border-[#272727]/5');
    el.innerHTML =
      '<div class="flex items-center justify-between mb-2">' +
      '<div class="flex items-center gap-2">' +
      '<h3 class="text-[#272727] text-sm font-semibold"></h3>' +
      (s.badge ? '<span class="bg-primary/20 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded">' + s.badge + '</span>' : '') +
      (s.custom ? '<span class="bg-blue-500/10 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded">سفارشی</span>' : '') +
      '</div>' +
      '<div class="flex gap-1">' +
      '<button data-del class="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"><i data-lucide="trash-2" class="w-3 h-3 text-red-400"></i></button>' +
      '</div></div>' +
      '<div class="flex items-center gap-3 text-[10px] text-[#272727]/30">' +
      '<span>قیمت: <span class="text-primary font-semibold">' + P.moneyShort(s.price) + '</span></span>' +
      '<span>مدت: ' + s.duration + '</span>' +
      '<span class="bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">فعال</span>' +
      '</div>';
    el.querySelector('h3').textContent = s.name;
    el.querySelector('[data-del]').addEventListener('click', function () {
      if (!s.custom) { P.toast('فقط خدمات سفارشی قابل حذف هستند'); return; }
      if (!confirm('«' + s.name + '» حذف شود؟')) return;
      var list = P.customServices().filter(function (c) { return c.id !== s.id; });
      localStorage.setItem('pirayesh-custom-services', JSON.stringify(list));
      render();
      P.toast('حذف شد');
    });
    return el;
  }

  function render() {
    var main = document.getElementById('adminMainList');
    var groom = document.getElementById('adminGroomList');
    main.innerHTML = ''; groom.innerHTML = '';
    var all = P.allServices();
    var mains = all.filter(function (s) { return s.cat === 'main'; });
    var grooms = all.filter(function (s) { return s.cat !== 'main'; });
    mains.forEach(function (s) { main.appendChild(card(s)); });
    grooms.forEach(function (s) { groom.appendChild(card(s)); });
    document.getElementById('countMain').textContent = P.fa(mains.length) + ' خدمت';
    document.getElementById('countGroom').textContent = P.fa(grooms.length) + ' پکیج';
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('svcSave').addEventListener('click', function () {
    var name = document.getElementById('svcName').value.trim();
    var price = parseInt(faDigitsToEn(document.getElementById('svcPrice').value).replace(/[^\d]/g, ''), 10) || 0;
    var minutes = parseInt(faDigitsToEn(document.getElementById('svcMinutes').value).replace(/[^\d]/g, ''), 10) || 30;
    if (!name || !price) { P.toast('نام و قیمت را وارد کنید'); return; }
    var list = P.customServices();
    list.push({
      id: 'custom-' + Date.now(), custom: true,
      cat: document.getElementById('svcCat').value,
      name: name, desc: document.getElementById('svcDesc').value.trim(),
      price: price, minutes: minutes,
      duration: P.fa(minutes) + ' دقیقه',
      img: '', includes: []
    });
    localStorage.setItem('pirayesh-custom-services', JSON.stringify(list));
    document.getElementById('addModal').style.display = 'none';
    ['svcName', 'svcDesc', 'svcPrice', 'svcMinutes'].forEach(function (id) { document.getElementById(id).value = ''; });
    render();
    P.toast('خدمت اضافه شد');
  });

  render();
})();
