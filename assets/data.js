/* پیرایش — shared data & helpers (loaded before app/page scripts) */
window.P = window.P || {};

/* ---------- Service catalog ---------- */
P.services = [
  {
    id: 'vip', cat: 'main', name: 'اصلاح VIP',
    desc: 'اصلاح صورت حرفه‌ای با حوله گرم و محصولات ممتاز',
    price: 350000, duration: '۴۵ دقیقه', minutes: 45,
    img: 'assets/services/vip.jpg',
    includes: ['اصلاح مو با قیچی و ماشین', 'اصلاح صورت با حوله گرم', 'شست‌وشو و استایلینگ', 'ماساژ صورت']
  },
  {
    id: 'facial', cat: 'main', name: 'پاکسازی و فیشیال',
    desc: 'پاکسازی عمقی و مراقبت حرفه‌ای پوست صورت با دستگاه',
    price: 450000, duration: '۶۰ دقیقه', minutes: 60,
    img: 'assets/services/facial.jpg',
    includes: ['پاکسازی عمیق منافذ', 'بخور و اکسیژن‌درمانی', 'ماسک مخصوص پوست', 'مرطوب‌کننده و ضدآفتاب']
  },
  {
    id: 'makeup', cat: 'main', name: 'میکاپ',
    desc: 'گریم و میکاپ حرفه‌ای مردانه برای مراسم و عکاسی',
    price: 500000, duration: '۶۰ دقیقه', minutes: 60,
    img: 'assets/services/makeup.jpg',
    includes: ['زیرسازی پوست', 'کاور و متعادل‌سازی', 'فیکس کردن آرایش', 'مناسب عکاسی و مراسم']
  },
  {
    id: 'keratin', cat: 'main', name: 'کراتین و پروتئینه',
    desc: 'ترمیم و تقویت عمیق مو با مواد کراتینه درجه‌یک',
    price: 800000, duration: '۹۰ دقیقه', minutes: 90,
    img: 'assets/services/keratin.jpg',
    includes: ['شست‌وشوی تخصصی', 'مواد کراتین درجه‌یک', 'اتوی حرفه‌ای', 'ماندگاری تا ۴ ماه']
  },
  {
    id: 'groom1', cat: 'groom', name: 'پکیج ۱: مراسم', badge: 'پایه',
    desc: 'پکیج پایه مخصوص داماد شامل خدمات اصلی آرایش و پاکسازی برای روز مراسم.',
    price: 6000000, duration: '۳ ساعت', minutes: 180,
    img: 'assets/services/groom1.jpg',
    includes: ['کوتاهی مو', 'استایل', 'اصلاح ریش', 'پاکسازی پوست', 'گریم']
  },
  {
    id: 'groom2', cat: 'groom', name: 'پکیج ۲: وی‌آی‌پی (گلد ۱)', badge: 'گلد',
    desc: 'پکیج ویژه با فشیال تخصصی و گریم حرفه‌ای برای دامادهای خوش‌پوش.',
    price: 8500000, duration: '۵ ساعت (۱ روز کاری)', minutes: 300,
    img: 'assets/services/groom2.jpg',
    includes: ['کوتاهی مو', 'طراحی مو و ریش (اصلاح کلاسیک)', 'استایل', 'فشیال تخصصی پوست', 'گریم تخصصی', 'متعادل‌سازی چهره']
  },
  {
    id: 'groom3', cat: 'groom', name: 'پکیج ۳: داماد', badge: 'محبوب‌ترین',
    desc: 'پکیج کامل و حرفه‌ای مخصوص داماد شامل تمامی خدمات آرایشی و زیبایی برای بهترین روز زندگی شما.',
    price: 9500000, duration: '۶ ساعت', minutes: 360,
    img: 'assets/services/groom3.jpg',
    includes: ['کوتاهی مو', 'طراحی مو و ریش به صورت کلاسیک (استایل)', 'فشیال پوست', 'زیرسازی', 'میکاپ', 'کانتور (متعادل‌سازی)']
  },
  {
    id: 'groom4', cat: 'groom', name: 'پکیج ۴: داماد', badge: 'لاکچری',
    desc: 'لوکس‌ترین پکیج داماد با فیشیال دو مرحله‌ای و پروتز موقت مو.',
    price: 11500000, duration: '۸ ساعت', minutes: 480,
    img: 'assets/services/groom4.jpg',
    includes: ['کوتاهی مو', 'طراحی مو و ریش کلاسیک', 'فید ریش و شقیقه', 'استایل', 'فیشیال تخصصی پوست (دوبار در دو روز)', 'زیرسازی پوست', 'کانتور پوست', 'متعادل‌سازی پوست', 'پروتز موقت مو']
  }
];

P.service = function (id) {
  var edits = P.serviceEdits();
  var s = P.services.find(function (x) { return x.id === id; }) || null;
  if (s && edits[id]) s = Object.assign({}, s, edits[id]);
  return s;
};

/* Custom services added from admin panel */
P.customServices = function () {
  try { return JSON.parse(localStorage.getItem('pirayesh-custom-services') || '[]'); }
  catch (e) { return []; }
};

/* Exact former defaults only: upgrade saved stock images without replacing custom photos. */
var LEGACY_SERVICE_IMAGES = {
  "vip": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop&auto=format&q=80",
  "facial": "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=600&h=400&fit=crop&auto=format&q=80",
  "makeup": "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=600&h=400&fit=crop&auto=format&q=80",
  "keratin": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=400&fit=crop&auto=format&q=80",
  "groom1": "https://images.unsplash.com/photo-1593702288056-7927b442d0fa?w=600&h=400&fit=crop&auto=format&q=80",
  "groom2": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop&auto=format&q=80",
  "groom3": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop&auto=format&q=80",
  "groom4": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop&auto=format&q=80"
};

/* Admin edits over the seed catalog (persisted in localStorage) */
P.serviceEdits = function () {
  try {
    var edits = JSON.parse(localStorage.getItem('pirayesh-service-edits') || '{}') || {};
    P.services.forEach(function (s) {
      if (edits[s.id] && edits[s.id].img === LEGACY_SERVICE_IMAGES[s.id]) {
        edits[s.id].img = s.img;
      }
    });
    return edits;
  }
  catch (e) { return {}; }
};
P.saveServiceEdit = function (id, patch) {
  var m = P.serviceEdits();
  m[id] = Object.assign({}, m[id] || {}, patch);
  localStorage.setItem('pirayesh-service-edits', JSON.stringify(m));
};
P.resetService = function (id) {
  var m = P.serviceEdits();
  delete m[id];
  localStorage.setItem('pirayesh-service-edits', JSON.stringify(m));
};
P.allServices = function () {
  var edits = P.serviceEdits();
  var base = P.services.map(function (s) { return edits[s.id] ? Object.assign({}, s, edits[s.id]) : s; });
  return base.concat(P.customServices());
};

P.findService = function (id) {
  return P.allServices().find(function (s) { return s.id === id; }) || null;
};

/* ---------- Formatting ---------- */
var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
P.fa = function (input) {
  return String(input).replace(/\d/g, function (d) { return FA_DIGITS[+d]; });
};
P.money = function (n) {
  return P.fa(Number(n).toLocaleString('en-US')).replace(/,/g, '٬') + ' تومان';
};
P.moneyShort = function (n) {
  return P.fa(Number(n).toLocaleString('en-US')).replace(/,/g, '٬') + ' ت';
};

/* ---------- Jalali calendar helpers (via Intl) ---------- */
P.jfmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
});
P.toEnDigits = function (str) {
  return String(str).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); })
                    .replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); });
};
P.jparts = function (date) {
  var parts = {};
  P.jfmt.formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
  return {
    jy: parseInt(P.toEnDigits(parts.year).replace(/[^0-9]/g, ''), 10),
    jm: parts.month,
    jd: parseInt(P.toEnDigits(parts.day).replace(/[^0-9]/g, ''), 10),
    weekday: parts.weekday,
    date: date
  };
};
/* Week index starting Saturday: شنبه=0 ... جمعه=5 */
P.weekIndex = function (date) { return (date.getDay() + 1) % 7; };
P.isFriday = function (date) { return date.getDay() === 5; };
P.dateKey = function (date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};
P.fromKey = function (key) {
  var p = key.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
};
P.addDays = function (date, n) {
  var d = new Date(date); d.setDate(d.getDate() + n); return d;
};
P.fullDateFa = function (date) {
  var j = P.jparts(date);
  return j.weekday + '، ' + P.fa(j.jd) + ' ' + j.jm + ' ' + P.fa(j.jy);
};
P.shortDateFa = function (date) {
  var j = P.jparts(date);
  return P.fa(j.jd) + ' ' + j.jm + ' ' + P.fa(j.jy);
};

/* ---------- Local storage store ---------- */
P.store = {
  _read: function (key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  },
  bookings: function () {
    return P.store._read('pirayesh-bookings', []);
  },
  saveBookings: function (list) {
    localStorage.setItem('pirayesh-bookings', JSON.stringify(list));
  },
  addBooking: function (b) {
    var list = P.store.bookings();
    list.unshift(b);
    P.store.saveBookings(list);
    return b;
  },
  updateBooking: function (id, patch) {
    var list = P.store.bookings();
    var i = list.findIndex(function (b) { return b.id === id; });
    if (i > -1) { Object.assign(list[i], patch); P.store.saveBookings(list); }
  },
  booking: function (id) {
    return P.store.bookings().find(function (b) { return b.id === id; }) || null;
  },
  nextCode: function () {
    var n = P.store._read('pirayesh-seq', 78);
    localStorage.setItem('pirayesh-seq', String(n + 1));
    return 'BK-' + String(n).padStart(3, '0');
  },
  draft: function () { return P.store._read('pirayesh-draft', null); },
  saveDraft: function (d) { localStorage.setItem('pirayesh-draft', JSON.stringify(d)); },
  clearDraft: function () { localStorage.removeItem('pirayesh-draft'); },
  _customerRecord: function (phone, saved) {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved) ||
        typeof saved.name !== 'string' || !saved.name.trim()) return null;
    function timestamp(value) {
      return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;
    }
    return {
      name: saved.name.trim(), phone: phone,
      birthDate: typeof saved.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(saved.birthDate) ? saved.birthDate : '',
      birthCalendar: 'persian',
      smsConsent: typeof saved.smsConsent === 'boolean' ? saved.smsConsent : null,
      smsConsentUpdatedAt: timestamp(saved.smsConsentUpdatedAt),
      smsConsentVersion: saved.smsConsentVersion === 'offers-v1' ? 'offers-v1' : null,
      termsVersion: typeof saved.termsVersion === 'string' ? saved.termsVersion : null,
      termsAcceptedAt: timestamp(saved.termsAcceptedAt),
      createdAt: timestamp(saved.createdAt), updatedAt: timestamp(saved.updatedAt)
    };
  },
  profile: function () {
    var session = P.auth && P.auth.session();
    var empty = { name: 'کاربر', phone: session ? session.phone : '', birthDate: '', birthCalendar: 'persian',
      smsConsent: null, smsConsentUpdatedAt: null, smsConsentVersion: null, termsVersion: null, termsAcceptedAt: null, createdAt: null, updatedAt: null };
    if (!session) return empty;
    var saved = P.store._read('pirayesh-profile:' + session.phone, null);
    // Preserve an existing profile only when it belongs to the verified number.
    var legacy = P.store._read('pirayesh-profile', null);
    if (!saved && legacy && P.auth.normalizePhone(legacy.phone) === session.phone) saved = legacy;
    return P.store._customerRecord(session.phone, saved) || empty;
  },
  saveProfile: function (p) {
    var session = P.auth && P.auth.session();
    if (!session) return;
    var existing = P.store.profile();
    var now = new Date().toISOString();
    var acceptedTerms = !P.auth.needsTerms();
    // The per-number profile IS the club record: one write, no duplicated list to drift out of sync.
    localStorage.setItem('pirayesh-profile:' + session.phone, JSON.stringify({
      name: p.name === undefined ? existing.name : p.name, phone: session.phone,
      birthDate: p.birthDate === undefined ? existing.birthDate : p.birthDate, birthCalendar: 'persian',
      // Preserve historical preferences; terms acceptance is recorded separately, not invented consent.
      smsConsent: existing.smsConsent,
      smsConsentUpdatedAt: existing.smsConsentUpdatedAt,
      smsConsentVersion: existing.smsConsentVersion,
      termsVersion: acceptedTerms ? session.termsVersion : existing.termsVersion,
      termsAcceptedAt: acceptedTerms ? session.termsAcceptedAt : existing.termsAcceptedAt,
      createdAt: existing.createdAt || now, updatedAt: now
    }));
  },
  customers: function () {
    if (!P.auth || !P.auth.isAdmin() || P.auth.needsTerms() || P.auth.needsProfile()) return [];
    var byPhone = new Map();
    var legacy = P.store._read('pirayesh-profile', null);
    var legacyPhone = legacy && P.auth.normalizePhone(legacy.phone);
    var legacyRecord = legacyPhone && P.store._customerRecord(legacyPhone, legacy);
    if (legacyRecord) byPhone.set(legacyPhone, legacyRecord);
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || key.indexOf('pirayesh-profile:') !== 0) continue;
      var phone = P.auth.normalizePhone(key.slice('pirayesh-profile:'.length));
      if (!phone) continue;
      var record = P.store._customerRecord(phone, P.store._read(key, null));
      if (!record) continue;
      var previous = byPhone.get(phone);
      if (!previous || (record.updatedAt || '') >= (previous.updatedAt || '')) byPhone.set(phone, record);
    }
    return Array.from(byPhone.values()).sort(function (a, b) {
      return (b.createdAt || '').localeCompare(a.createdAt || '') || a.name.localeCompare(b.name, 'fa');
    });
  },
  /* Seed demo data on first run */
  seed: function () {
    if (localStorage.getItem('pirayesh-seeded')) return;
    if (P.store.bookings().length) { localStorage.setItem('pirayesh-seeded', '1'); return; }
    var today = new Date();
    var mk = function (offsetDays, serviceId, time, status, paid) {
      var s = P.service(serviceId);
      var d = P.addDays(today, offsetDays);
      return {
        id: 'BK-' + String(Math.floor(100 + Math.random() * 800)),
        serviceId: serviceId, name: s.name, price: s.price,
        dateKey: P.dateKey(d), time: time, status: status, paid: paid,
        customer: 'امیرحسین محمدی', phone: '۰۹۱۲۳۴۵۴۵۶۷',
        createdAt: Date.now()
      };
    };
    var list = [
      mk(3, 'groom3', '۱۱:۰۰', 'confirmed', true),
      mk(5, 'vip', '۱۴:۰۰', 'pending', false),
      mk(-7, 'facial', '۱۰:۰۰', 'done', true)
    ];
    P.store.saveBookings(list);
    localStorage.setItem('pirayesh-seeded', '1');
    localStorage.setItem('pirayesh-seq', '80');
  }
};

/* ---------- Toast ---------- */
P.toast = function (msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%);background:#111111;color:#FFFFFF;font-size:12px;font-weight:600;padding:10px 20px;border-radius:14px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.25);font-family:inherit;';
  document.body.appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 1800);
  setTimeout(function () { t.remove(); }, 2300);
};

P.store.seed();
