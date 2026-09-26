/* Admin access is managed only by the two fixed owners (mock/local-only roles). */
(function () {
  if (!P.auth.isAdmin()) return;
  var fields = document.getElementById('adminAccessFields');
  var input = document.getElementById('newAdminPhone');
  var error = document.getElementById('adminAccessError');
  var success = document.getElementById('adminAccessSuccess');

  function listNumbers(id, numbers, label) {
    var list = document.getElementById(id);
    list.textContent = '';
    numbers.forEach(function (phone) {
      var row = document.createElement('li');
      row.className = 'flex items-center justify-between gap-3 bg-canvas rounded-xl px-3 py-2';
      var number = document.createElement('span');
      number.dir = 'ltr';
      number.className = 'text-[#111111] text-sm font-semibold';
      number.textContent = P.fa(phone);
      var badge = document.createElement('span');
      badge.className = 'text-[#111111]/60 text-xs';
      badge.textContent = label;
      row.appendChild(number);
      row.appendChild(badge);
      list.appendChild(row);
    });
  }

  function render() {
    fields.disabled = !P.auth.isOwner();
    document.getElementById('adminAccessHelp').textContent = P.auth.isOwner()
      ? 'شما مالک هستید. شماره‌های اضافه‌شده به پنل مدیریت دسترسی دارند، اما نمی‌توانند مدیر جدید اضافه کنند.'
      : 'شما مدیر هستید. افزودن مدیر جدید فقط برای مالکان فعال است؛ این بخش برای شما فقط خواندنی است.';
    listNumbers('ownerNumbers', P.auth.owners(), 'مالک');
    var admins = P.auth.admins();
    listNumbers('adminNumbers', admins, 'مدیر');
    document.getElementById('noAdmins').hidden = admins.length !== 0;
  }

  document.getElementById('addAdminForm').addEventListener('submit', function (event) {
    event.preventDefault();
    error.hidden = true;
    success.hidden = true;
    input.removeAttribute('aria-invalid');
    try {
      var phone = P.auth.addAdmin(input.value); // Re-check current owner permissions on every write.
      input.value = '';
      render();
      success.textContent = 'شماره ' + P.fa(phone) + ' به مدیران اضافه شد.';
      success.hidden = false;
      input.focus();
    } catch (e) {
      fields.disabled = !P.auth.isOwner();
      error.textContent = e.message;
      error.hidden = false;
      if (!fields.disabled) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
    }
  });

  document.getElementById('saveSettings').addEventListener('click', function () {
    if (P.auth.isAdmin()) P.toast('تنظیمات ذخیره شد');
  });
  window.addEventListener('pageshow', render);
  render();
})();
