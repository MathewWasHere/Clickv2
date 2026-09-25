/* admin services: list catalog + custom services, add/edit via modals, edit seed prices/details, delete custom */
(function () {
  function enDigits(str) {
    return String(str).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); });
  }
  function parseNum(el) {
    return parseInt(enDigits(el.value).replace(/[^\d]/g, ''), 10) || 0;
  }

  function card(s) {
    var el = document.createElement('div');
    el.className = 'bg-surface rounded-xl border p-3 elev';
    el.classList.add(s.badge === 'محبوب‌ترین' ? 'border-primary/15' : 'border-line');
    var edited = !s.custom && P.serviceEdits()[s.id];
    el.innerHTML =
      '<div class="flex items-center justify-between mb-2">' +
      '<div class="flex items-center gap-2 flex-wrap">' +
      '<h3 class="text-fg text-sm font-semibold"></h3>' +
      (s.badge ? '<span class="bg-primary/20 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded">' + s.badge + '</span>' : '') +
      (s.custom ? '<span class="bg-info/10 text-info text-[8px] font-bold px-1.5 py-0.5 rounded">سفارشی</span>' : '') +
      (edited ? '<span class="bg-warn/10 text-warn text-[8px] font-bold px-1.5 py-0.5 rounded">ویرایش‌شده</span>' : '') +
      '</div>' +
      '<div class="flex gap-1">' +
      '<button data-edit class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><i data-lucide="pencil" class="w-3 h-3 text-primary"></i></button>' +
      '<button data-del class="w-7 h-7 rounded-lg bg-err/10 flex items-center justify-center"><i data-lucide="trash-2" class="w-3 h-3 text-err"></i></button>' +
      '</div></div>' +
      (s.desc ? '<p class="text-muted text-[10px] leading-relaxed mb-2"></p>' : '') +
      '<div class="flex items-center gap-3 text-[10px] text-faint">' +
      '<span>قیمت: <span class="text-primary font-semibold">' + P.moneyShort(s.price) + '</span></span>' +
      '<span>مدت: ' + s.duration + '</span>' +
      '</div>';
    el.querySelector('h3').textContent = s.name;
    if (s.desc) el.querySelector('p[data-desc], p').textContent = s.desc;

    el.querySelector('[data-edit]').addEventListener('click', function () { openEdit(s); });

    el.querySelector('[data-del]').addEventListener('click', function () {
      if (!s.custom) { P.toast('خدمات پیش‌فرض قابل حذف نیستند'); return; }
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

  /* ---------- edit modal ---------- */
  var modal = document.getElementById('editModal');
  var F = {
    id: document.getElementById('eId'),
    name: document.getElementById('eName'),
    desc: document.getElementById('eDesc'),
    price: document.getElementById('ePrice'),
    minutes: document.getElementById('eMinutes'),
    includes: document.getElementById('eIncludes'),
    img: document.getElementById('eImg'),
    reset: document.getElementById('editReset'),
    save: document.getElementById('editSave')
  };

  function openEdit(s) {
    F.id.value = s.id;
    F.name.value = s.name || '';
    F.desc.value = s.desc || '';
    F.price.value = P.fa(String(s.price));
    F.minutes.value = P.fa(String(s.minutes || 30));
    F.includes.value = (s.includes || []).join('\n');
    F.img.value = s.img || '';
    F.reset.style.display = s.custom ? 'none' : 'block';
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }

  F.save.addEventListener('click', function () {
    var id = F.id.value;
    var name = F.name.value.trim();
    var price = parseNum(F.price);
    var minutes = parseNum(F.minutes) || 30;
    if (!name || !price) { P.toast('نام و قیمت را وارد کنید'); return; }
    var patch = {
      name: name,
      desc: F.desc.value.trim(),
      price: price,
      minutes: minutes,
      duration: P.fa(minutes) + ' دقیقه',
      img: F.img.value.trim(),
      includes: F.includes.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean)
    };
    if (id.indexOf('custom-') === 0) {
      var list = P.customServices();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { patch.custom = true; patch.cat = list[i].cat; list[i] = Object.assign({}, list[i], patch); break; }
      }
      localStorage.setItem('pirayesh-custom-services', JSON.stringify(list));
    } else {
      P.saveServiceEdit(id, patch);
    }
    modal.style.display = 'none';
    render();
    P.toast('ذخیره شد');
  });

  F.reset.addEventListener('click', function () {
    P.resetService(F.id.value);
    modal.style.display = 'none';
    render();
    P.toast('به پیش‌فرض بازگشت');
  });

  /* ---------- add modal (unchanged behavior) ---------- */
  document.getElementById('svcSave').addEventListener('click', function () {
    var name = document.getElementById('svcName').value.trim();
    var price = parseNum(document.getElementById('svcPrice'));
    var minutes = parseNum(document.getElementById('svcMinutes')) || 30;
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
