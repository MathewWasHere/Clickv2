/* Demo-only phone authentication. NOT an authorization/security boundary.
   Replace with server-side sessions, real OTP delivery and admin roles before deployment. */
(function () {
  window.P = window.P || {};
  var KEY = 'pirayesh-demo-session';
  var TERMS_VERSION = 'terms-draft-v1';
  var ADMINS_KEY = 'pirayesh-demo-admins';
  // Owners are fixed in code, never read from the editable admin list or session roles.
  var OWNERS = ['09961217945', '09177905028'];
  var protectedPages = [
    'profile.html', 'my-bookings.html', 'payment.html', 'confirmation.html',
    'admin-dashboard.html', 'admin-bookings.html', 'admin-services.html', 'admin-settings.html'
  ];
  // Booking is public, but remains a safe return destination after optional login.
  var returnPages = protectedPages.concat(['booking.html']);
  var page = location.pathname.split('/').pop();
  var protectedPage = protectedPages.indexOf(page) !== -1;

  function digits(value) {
    return String(value || '').replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); })
      .replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); });
  }

  function normalizePhone(value) {
    var phone = digits(value).replace(/[\s()\-]/g, '');
    phone = phone.replace(/^(?:\+98|0098)/, '0');
    return /^09\d{9}$/.test(phone) ? phone : null;
  }

  function session() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      return saved && saved.demo === true && typeof saved.phone === 'string' &&
        normalizePhone(saved.phone) === saved.phone ? saved : null;
    } catch (e) { return null; }
  }

  function needsTerms() {
    var current = session();
    return !current || current.termsVersion !== TERMS_VERSION ||
      typeof current.termsAcceptedAt !== 'string' || !Number.isFinite(Date.parse(current.termsAcceptedAt));
  }

  function needsProfile() {
    var current = session();
    return !!current && current.profilePending === true;
  }

  function admins() {
    try {
      var saved = JSON.parse(localStorage.getItem(ADMINS_KEY));
      if (!Array.isArray(saved)) return [];
      return saved.map(normalizePhone).filter(function (phone, index, list) {
        return phone && OWNERS.indexOf(phone) === -1 && list.indexOf(phone) === index;
      });
    } catch (e) { return []; }
  }

  function isOwner() {
    var current = session();
    return !!current && OWNERS.indexOf(current.phone) !== -1;
  }

  function isAdmin() {
    var current = session();
    return !!current && (isOwner() || admins().indexOf(current.phone) !== -1);
  }

  function isAdminPage(value) {
    return /^admin-(dashboard|bookings|services|settings)\.html(?:[?#]|$)/.test(value);
  }

  function destination(value) {
    var next = safeNext(value);
    return isAdminPage(next) && !isAdmin() ? 'profile.html?admin=denied' : next;
  }

  // Accept only local app pages, preserving booking queries without allowing open redirects.
  function safeNext(value) {
    try {
      var base = new URL('.', location.href);
      var target = new URL(value || 'profile.html', base);
      var file = target.pathname.slice(base.pathname.length);
      if (target.origin === base.origin && target.pathname.indexOf(base.pathname) === 0 &&
          returnPages.indexOf(file) !== -1 && !target.username && !target.password) {
        return file + target.search + target.hash;
      }
    } catch (e) {}
    return 'profile.html';
  }

  function redirectToLogin(target) {
    document.documentElement.style.visibility = 'hidden';
    var next = safeNext(target || page + location.search + location.hash);
    location.replace('login.html?next=' + encodeURIComponent(next));
  }

  function requireLogin(target) {
    if (!session() || needsTerms() || needsProfile()) { redirectToLogin(target); return false; }
    return true;
  }

  function guard() {
    if (protectedPage && !requireLogin()) return false;
    if (isAdminPage(page) && !isAdmin()) {
      document.documentElement.style.visibility = 'hidden';
      location.replace('profile.html?admin=denied');
      return false;
    }
    document.documentElement.style.visibility = '';
    return true;
  }

  P.auth = {
    digits: digits,
    normalizePhone: normalizePhone,
    session: session,
    needsProfile: needsProfile,
    needsTerms: needsTerms,
    termsVersion: TERMS_VERSION,
    safeNext: safeNext,
    destination: destination,
    requireLogin: requireLogin,
    isOwner: isOwner,
    isAdmin: isAdmin,
    owners: function () { return OWNERS.slice(); },
    admins: admins,
    addAdmin: function (value) {
      // Enforce the owner check here too, not just on disabled form controls.
      if (!isOwner()) throw new Error('فقط مالکان می‌توانند مدیر جدید اضافه کنند.');
      var phone = normalizePhone(value);
      if (!phone) throw new Error('شماره موبایل معتبر وارد کنید.');
      if (OWNERS.indexOf(phone) !== -1) throw new Error('این شماره متعلق به مالک است و از قبل دسترسی دارد.');
      var list = admins();
      if (list.indexOf(phone) !== -1) throw new Error('این شماره قبلاً به مدیران اضافه شده است.');
      list.push(phone);
      try { localStorage.setItem(ADMINS_KEY, JSON.stringify(list)); }
      catch (e) { throw new Error('ذخیره مدیر ممکن نیست. ذخیره‌سازی مرورگر را بررسی کنید.'); }
      return phone;
    },
    login: function (phone, code, acceptedTerms) {
      phone = normalizePhone(phone);
      if (!phone) throw new Error('شماره موبایل معتبر وارد کنید؛ مانند ۰۹۱۷۹۰۹۵۰۲۸.');
      if (digits(code).trim() !== '1234') throw new Error('کد تأیید نادرست است. کد آزمایشی ۱۲۳۴ است.');
      if (acceptedTerms !== true) {
        var error = new Error('برای ورود، شرایط استفاده را مطالعه و تأیید کنید.');
        error.field = 'terms';
        throw error;
      }
      try {
        localStorage.setItem(KEY, JSON.stringify({ phone: phone, demo: true, profilePending: true,
          termsVersion: TERMS_VERSION, termsAcceptedAt: new Date().toISOString() }));
      } catch (e) {
        throw new Error('ذخیره ورود ممکن نیست. لطفاً ذخیره‌سازی مرورگر را فعال کنید.');
      }
    },
    completeProfile: function (name, birthDate, verifiedPhone) {
      var current = session();
      if (!current || needsTerms() || current.phone !== verifiedPhone) {
        throw new Error('نشست ورود تغییر کرده است. صفحه را تازه کنید و دوباره وارد شوید.');
      }
      var details = P.profileDetails.validate(name, birthDate);
      // Finish login only after the profile has been successfully persisted.
      try {
        P.store.saveProfile(details);
        localStorage.setItem(KEY, JSON.stringify(Object.assign({}, current, { profilePending: false })));
      } catch (e) {
        throw new Error('ذخیره اطلاعات ممکن نیست. ذخیره‌سازی مرورگر را بررسی کنید و دوباره تلاش کنید.');
      }
    },
    logout: function () {
      // Preserve bookings, catalog, theme and saved profiles; discard only the session and draft.
      localStorage.removeItem(KEY);
      localStorage.removeItem('pirayesh-draft');
      redirectToLogin();
    }
  };

  guard();
  window.addEventListener('pageshow', guard); // Re-check pages restored with the browser Back button.
  window.addEventListener('storage', function (event) {
    if (event.key !== KEY && event.key !== ADMINS_KEY && event.key !== null) return;
    if (protectedPage && guard()) location.reload();
    else if (page === 'login.html' && session()) location.reload();
  });
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-logout]');
    if (!button) return;
    event.preventDefault();
    try { P.auth.logout(); }
    catch (e) { window.alert('خروج ممکن نشد. لطفاً ذخیره‌سازی مرورگر را بررسی کنید و دوباره تلاش کنید.'); }
  });
})();
