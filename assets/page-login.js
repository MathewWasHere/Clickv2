/* Phone → mock OTP (1234) → name and Jalali birth date → requested page. */
(function () {
  var next = P.auth.safeNext(new URLSearchParams(location.search).get('next'));
  if (P.auth.session() && !P.auth.needsTerms() && !P.auth.needsProfile()) { location.replace(P.auth.destination(next)); return; }

  var checkoutReturn = new URL(next, location.href);
  if (checkoutReturn.pathname.endsWith('/payment.html') && !checkoutReturn.searchParams.has('b') && P.store.draft()) {
    document.getElementById('loginBookingBack').hidden = false;
  }

  var phoneForm = document.getElementById('phoneForm');
  var codeForm = document.getElementById('codeForm');
  var detailsForm = document.getElementById('detailsForm');
  var phoneInput = document.getElementById('loginPhone');
  var codeInput = document.getElementById('loginCode');
  var termsInput = document.getElementById('acceptTerms');
  var nameInput = document.getElementById('loginName');
  var birthYear = document.getElementById('birthYear');
  var birthMonth = document.getElementById('birthMonth');
  var birthDay = document.getElementById('birthDay');
  var months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  var heading = document.getElementById('loginHeading');
  var description = document.getElementById('loginDescription');
  var error = document.getElementById('loginError');
  var phone = null;

  function clearError() {
    error.textContent = '';
    error.hidden = true;
    [phoneInput, codeInput, termsInput, nameInput, birthYear, birthMonth, birthDay].forEach(function (input) {
      input.removeAttribute('aria-invalid');
    });
  }
  function showError(message, input) {
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
  function option(select, value, label) {
    var item = document.createElement('option');
    item.value = String(value);
    item.textContent = label;
    select.appendChild(item);
  }
  function reset(select, label) {
    select.textContent = '';
    option(select, '', label);
  }
  function updateDays() {
    var previous = birthDay.value;
    var today = P.profileDetails.today();
    var year = +birthYear.value, month = +birthMonth.value;
    reset(birthDay, 'روز');
    birthDay.disabled = !year || !month;
    var max = P.profileDetails.daysInMonth(year, month);
    if (year === today.year && month === today.month) max = Math.min(max, today.day);
    for (var day = 1; day <= max; day++) option(birthDay, day, P.fa(day));
    // Preserve a valid selected day, otherwise require a new choice (don't silently change a birthday).
    birthDay.value = previous;
    if (birthDay.selectedIndex < 0) birthDay.value = '';
  }
  function updateMonths() {
    var previous = birthMonth.value;
    var today = P.profileDetails.today();
    var year = +birthYear.value;
    reset(birthMonth, 'ماه');
    birthMonth.disabled = !year;
    var max = !year ? 0 : year === today.year ? today.month : 12;
    for (var month = 1; month <= max; month++) option(birthMonth, month, months[month - 1]);
    birthMonth.value = previous;
    if (birthMonth.selectedIndex < 0) birthMonth.value = '';
    updateDays();
  }
  function fillBirthday(savedDate) {
    var saved = savedDate ? savedDate.split('-') : [];
    var today = P.profileDetails.today();
    // Include older saved dates as well as the default 120-year selection range.
    var oldest = Math.max(1, Math.min(today.year - 120, +saved[0] || today.year));
    reset(birthYear, 'سال');
    for (var year = today.year; year >= oldest; year--) option(birthYear, year, P.fa(year));
    birthYear.value = saved[0] || '';
    updateMonths();
    birthMonth.value = saved[1] ? String(+saved[1]) : '';
    updateDays();
    birthDay.value = saved[2] ? String(+saved[2]) : '';
  }
  birthYear.addEventListener('change', function () { clearError(); updateMonths(); });
  birthMonth.addEventListener('change', function () { clearError(); updateDays(); });
  birthDay.addEventListener('change', clearError);

  function showDetails() {
    var current = P.auth.session();
    if (!current) { location.reload(); return; }
    phone = current.phone;
    clearError();
    phoneForm.hidden = true;
    codeForm.hidden = true;
    detailsForm.hidden = false;
    heading.textContent = 'اطلاعات شما';
    description.textContent = 'شماره شما تأیید شد. برای تکمیل ورود، نام و تاریخ تولد خود را وارد کنید.';
    var profile = P.store.profile();
    nameInput.value = profile.name === 'کاربر' ? '' : profile.name;
    fillBirthday(profile.birthDate);
    nameInput.focus();
  }

  phoneForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearError();
    phone = P.auth.normalizePhone(phoneInput.value);
    if (!phone) {
      showError('شماره موبایل معتبر وارد کنید؛ مانند ۰۹۱۷۹۰۹۵۰۲۸.', phoneInput);
      return;
    }
    if (!termsInput.checked) {
      showError('برای ورود، شرایط استفاده را مطالعه و تأیید کنید.', termsInput);
      return;
    }
    document.getElementById('loginPhoneDisplay').textContent = phone;
    phoneForm.hidden = true;
    codeForm.hidden = false;
    description.textContent = 'کد تأیید را وارد کنید تا به مرحله اطلاعات شخصی بروید.';
    codeInput.value = '';
    codeInput.focus();
  });

  codeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearError();
    if (!phone) return;
    try {
      P.auth.login(phone, codeInput.value, termsInput.checked);
      showDetails();
    } catch (e) {
      if (e.field === 'terms') { codeForm.hidden = true; phoneForm.hidden = false; }
      showError(e.message, e.field === 'terms' ? termsInput : codeInput);
    }
  });

  detailsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearError();
    try {
      P.auth.completeProfile(nameInput.value, [birthYear.value, birthMonth.value, birthDay.value].join('/'), phone);
      location.replace(P.auth.destination(next));
    } catch (e) {
      var dateField = !birthYear.value ? birthYear : !birthMonth.value ? birthMonth : birthDay;
      showError(e.message, e.field === 'birthDate' ? dateField : nameInput);
    }
  });

  document.getElementById('editLoginPhone').addEventListener('click', function () {
    clearError();
    phone = null;
    codeInput.value = '';
    codeForm.hidden = true;
    phoneForm.hidden = false;
    description.textContent = 'برای ورود، شماره موبایل خود را وارد کنید.';
    phoneInput.focus();
  });
  if (!P.auth.needsTerms() && P.auth.needsProfile()) showDetails();
  else phoneInput.focus();
})();
