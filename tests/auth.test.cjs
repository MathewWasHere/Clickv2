const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/auth.js'), 'utf8');
const KEY = 'pirayesh-demo-session';
const protectedPages = ['profile.html', 'my-bookings.html', 'payment.html',
  'confirmation.html', 'admin-dashboard.html', 'admin-bookings.html', 'admin-services.html', 'admin-settings.html'];

function app(page = 'login.html', initial = {}) {
  const storage = new Map(Object.entries(initial));
  const events = {};
  const url = new URL(page, 'https://preview.example/shop/');
  const location = { href: url.href, pathname: url.pathname, search: url.search, hash: url.hash,
    replace(value) { this.redirect = value; }, reload() { this.reloaded = true; } };
  const context = { URL, location, document: { documentElement: { style: {} },
    addEventListener(name, callback) { events['document:' + name] = callback; } },
    localStorage: { get length() { return storage.size; }, key: index => [...storage.keys()][index] ?? null,
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    addEventListener(name, callback) { events[name] = callback; }, alert() {} };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return { auth: context.P.auth, context, storage, location, events };
}

test('normalizes Persian, Arabic, international and local Iranian mobile numbers', () => {
  const { auth } = app();
  for (const phone of ['۰۹۱۷۹۰۹۵۰۲۸', '٠٩١٧٩٠٩٥٠٢٨', '+98 917 909 5028', '00989179095028', '09179095028']) {
    assert.equal(auth.normalizePhone(phone), '09179095028');
  }
  for (const phone of ['', '1234', '02112345678', '0917909502', '091790950280', '0917909502x']) {
    assert.equal(auth.normalizePhone(phone), null);
  }
});

test('only 1234 (including localized digits) creates a persistent demo session', () => {
  const a = app();
  assert.throws(() => a.auth.login('invalid', '1234', true));
  for (const code of ['', '0000', '12345', '12a4']) assert.throws(() => a.auth.login('09179095028', code, true));
  assert.equal(a.auth.session(), null);
  for (const code of ['1234', '۱۲۳۴', '١٢٣٤']) {
    a.auth.login('۰۹۱۷۹۰۹۵۰۲۸', code, true);
    assert.equal(a.auth.session().phone, '09179095028');
  }
  assert(!a.storage.get(KEY).includes('1234'));
  const restored = app('profile.html', Object.fromEntries(a.storage));
  assert.equal(restored.auth.needsProfile(), true);
  assert.equal(restored.location.redirect, 'login.html?next=profile.html');
});

test('malformed sessions fail closed', () => {
  for (const value of ['broken', 'null', '{}', '{"demo":true,"phone":null}', '{"demo":true,"phone":""}', '{"demo":true,"phone":"bad"}']) {
    const a = app('profile.html', { [KEY]: value });
    assert.equal(a.auth.session(), null);
    assert(a.location.redirect.startsWith('login.html?next='));
  }
});

test('safe return URLs stay in the app directory and retain booking parameters', () => {
  const { auth } = app();
  assert.equal(auth.safeNext('booking.html?s=groom3#summary'), 'booking.html?s=groom3#summary');
  assert.equal(auth.safeNext('admin-dashboard.html'), 'admin-dashboard.html');
  for (const url of ['https://evil.example/profile.html', '//evil.example/profile.html', 'javascript:alert(1)',
    '../profile.html', '/profile.html', 'login.html', 'home.html', 'https://user:pass@preview.example/shop/profile.html']) {
    assert.equal(auth.safeNext(url), 'profile.html');
  }
});

test('every private page includes the early guard and redirects while logged out', () => {
  for (const file of protectedPages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert(html.indexOf('src="assets/auth.js"') < html.indexOf('<body'));
    const a = app(file);
    assert.equal(a.location.redirect, 'login.html?next=' + encodeURIComponent(file));
    assert.equal(a.context.document.documentElement.style.visibility, 'hidden');
  }
});

test('logout buttons use the shared handler in profile and admin settings', () => {
  for (const file of ['profile.html', 'admin-settings.html']) {
    assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /<button[^>]*data-logout/);
  }
  const a = app('admin-settings.html');
  a.auth.login('09179095028', '1234', true);
  a.events['document:click']({ target: { closest: () => ({}) }, preventDefault() {} });
  assert.equal(a.auth.session(), null);
  assert.match(a.location.redirect, /^login.html\?next=admin-settings.html$/);
});

test('logout clears session/draft, preserves saved demo data and rechecks history/tabs', () => {
  const a = app('profile.html', { 'pirayesh-bookings': '[{"id":"demo"}]', 'pirayesh-draft': '{}', 'pirayesh-theme': 'dark' });
  a.auth.login('09179095028', '1234', true);
  a.auth.logout();
  assert.equal(a.storage.has(KEY), false);
  assert.equal(a.storage.has('pirayesh-draft'), false);
  assert.equal(a.storage.get('pirayesh-theme'), 'dark');
  assert.equal(a.storage.get('pirayesh-bookings'), '[{"id":"demo"}]');
  a.location.redirect = null;
  a.events.pageshow();
  assert(a.location.redirect.startsWith('login.html'));
  a.location.redirect = null;
  a.events.storage({ key: KEY });
  assert(a.location.redirect.startsWith('login.html'));
});

test('storage failures do not pretend login succeeded', () => {
  const a = app();
  a.context.localStorage.setItem = () => { throw new Error('blocked'); };
  assert.throws(() => a.auth.login('09179095028', '1234', true));
  assert.equal(a.auth.session(), null);
});

test('profiles are keyed by verified number and preserve matching legacy names', () => {
  const a = app('login.html', { 'pirayesh-seeded': '1', 'pirayesh-profile': JSON.stringify({ name: 'علی', phone: '۰۹۱۷۹۰۹۵۰۲۸' }) });
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/data.js'), 'utf8'), a.context);
  const store = a.context.P.store;
  a.auth.login('09179095028', '1234', true);
  assert.equal(store.profile().name, 'علی');
  store.saveProfile({ name: 'رضا', phone: '09120000000' });
  assert.equal(store.profile().phone, '09179095028');
  a.auth.login('09120000000', '1234', true);
  assert.equal(store.profile().name, 'کاربر');
  a.auth.login('09179095028', '1234', true);
  assert.equal(store.profile().name, 'رضا');
});

const ADMINS_KEY = 'pirayesh-demo-admins';
const OWNERS = ['09961217945', '09177905028'];
const sessionFor = phone => JSON.stringify({ phone, demo: true, termsVersion: 'terms-draft-v1', termsAcceptedAt: '2026-09-26T00:00:00.000Z' });

test('both exact owner numbers have permanent admin and owner access', () => {
  for (const phone of OWNERS) {
    const a = app('admin-settings.html', { [KEY]: sessionFor(phone), [ADMINS_KEY]: 'broken' });
    assert.equal(a.auth.isOwner(), true);
    assert.equal(a.auth.isAdmin(), true);
    assert.equal(a.location.redirect, undefined);
    a.auth.owners().splice(0); // Exposing the list must not let callers change the owners.
    assert.equal(a.auth.owners().join(','), OWNERS.join(','));
    assert.equal(a.auth.isOwner(), true);
    assert.throws(() => a.auth.addAdmin(phone));
  }
  const supportNumber = app('profile.html', { [KEY]: sessionFor('09179095028') });
  assert.equal(supportNumber.auth.isOwner(), false); // Different from owner 09177905028.
});

test('owners add normalized numbers persistently; invalid/duplicate/owner entries are rejected', () => {
  const a = app('admin-settings.html', { [KEY]: sessionFor(OWNERS[0]) });
  assert.throws(() => a.auth.addAdmin('invalid'));
  assert.equal(a.auth.addAdmin('۰۹۱۷۹۰۹۵۰۲۸'), '09179095028');
  assert.equal(a.auth.admins().join(','), '09179095028');
  assert.throws(() => a.auth.addAdmin('+98 917 909 5028'));
  assert.throws(() => a.auth.addAdmin('۰۹۱۷۷۹۰۵۰۲۸'));
  a.auth.login(OWNERS[1], '1234', true);
  a.auth.addAdmin('09120000000');
  const restored = app('admin-dashboard.html', { ...Object.fromEntries(a.storage), [KEY]: sessionFor('09179095028') });
  assert.equal(restored.auth.isAdmin(), true);
  assert.equal(restored.auth.isOwner(), false);
  assert.equal(restored.location.redirect, undefined);
});

test('admins, customers and anonymous callers cannot add admins, even through direct API calls', () => {
  for (const phone of ['09179095028', '09121111111', null]) {
    const a = app('login.html', { [ADMINS_KEY]: '["09179095028"]', ...(phone ? { [KEY]: sessionFor(phone) } : {}) });
    const before = a.storage.get(ADMINS_KEY);
    assert.throws(() => a.auth.addAdmin('09120000000'), /فقط مالکان/);
    assert.equal(a.storage.get(ADMINS_KEY), before);
  }
  const a = app('admin-settings.html', { [KEY]: sessionFor(OWNERS[0]) });
  a.storage.set(KEY, sessionFor('09179095028')); // Permissions are not cached at initial page load.
  assert.throws(() => a.auth.addAdmin('09120000000'), /فقط مالکان/);
});

test('all admin URLs and login return URLs deny ordinary customers without blocking customer pages', () => {
  for (const file of protectedPages.filter(p => p.startsWith('admin-'))) {
    const a = app(file, { [KEY]: sessionFor('09179095028') });
    assert.equal(a.location.redirect, 'profile.html?admin=denied');
    assert.equal(a.context.document.documentElement.style.visibility, 'hidden');
    assert.equal(a.auth.destination(file + '?test=1'), 'profile.html?admin=denied');
    for (const phone of OWNERS.concat('09120000000')) {
      const allowed = app(file, { [KEY]: sessionFor(phone), [ADMINS_KEY]: '["09120000000"]' });
      assert.equal(allowed.location.redirect, undefined);
      assert.equal(allowed.auth.destination(file), file);
    }
  }
  const a = app('profile.html', { [KEY]: sessionFor('09179095028') });
  assert.equal(a.location.redirect, undefined);
  assert.equal(a.auth.destination('booking.html?s=groom3'), 'booking.html?s=groom3');
});

test('history restores and cross-tab admin list updates re-check current access', () => {
  const a = app('admin-settings.html', { [KEY]: sessionFor('09179095028'), [ADMINS_KEY]: '["09179095028"]' });
  a.storage.delete(ADMINS_KEY);
  a.events.storage({ key: ADMINS_KEY });
  assert.equal(a.location.redirect, 'profile.html?admin=denied');
  a.location.redirect = null;
  a.events.pageshow();
  assert.equal(a.location.redirect, 'profile.html?admin=denied');
});

test('malformed lists fail closed; role claims in sessions do not grant ownership', () => {
  for (const list of ['null', '{}', '"09179095028"', 'broken', '[null,"bad",42]']) {
    const a = app('login.html', { [KEY]: sessionFor('09179095028'), [ADMINS_KEY]: list });
    assert.equal(a.auth.isAdmin(), false);
  }
  const a = app('login.html', { [KEY]: JSON.stringify({phone:'09179095028',demo:true,role:'owner'}),
    [ADMINS_KEY]: '["09179095028","۰۹۱۷۹۰۹۵۰۲۸","09961217945"]' });
  assert.equal(a.auth.isOwner(), false);
  assert.equal(a.auth.admins().length, 1);
});

test('failed admin list writes do not report success or affect permanent owners', () => {
  const a = app('admin-settings.html', { [KEY]: sessionFor(OWNERS[0]) });
  a.context.localStorage.setItem = () => { throw new Error('blocked'); };
  assert.throws(() => a.auth.addAdmin('09179095028'));
  assert.equal(a.auth.admins().length, 0);
  assert.equal(a.auth.isOwner(), true);
});

test('admin manager is visible but disabled by default and the settings script is cached', () => {
  const html = fs.readFileSync(path.join(root, 'admin-settings.html'), 'utf8');
  assert.match(html, /<fieldset id="adminAccessFields" disabled/);
  assert.match(html, /id="addAdminForm"/);
  assert.match(html, /src="assets\/page-admin-settings.js"/);
  assert.match(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), /assets\/page-admin-settings.js/);
});

function loadProfileDetails(a) {
  a.storage.set('pirayesh-seeded', '1');
  for (const file of ['assets/data.js', 'assets/profile-details.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), a.context);
  }
}

test('Jalali birth dates accept localized digits and reject invalid, non-leap and future dates', () => {
  const a = app();
  loadProfileDetails(a);
  const parse = value => a.context.P.profileDetails.birthDate(value, new Date('2026-09-26T12:00:00Z'));
  assert.equal(parse('۱۳۷۵/۰۶/۱۵'), '1375-06-15');
  assert.equal(parse('١٣٧٥/٦/١٥'), '1375-06-15');
  assert.equal(parse('1399/12/30'), '1399-12-30');
  assert.equal(parse('1403/12/30'), '1403-12-30');
  assert.equal(parse('1405/07/04'), '1405-07-04');
  for (const date of ['', 'abc', '15/06/1375', '1375/00/10', '1375/13/10', '1375/01/32',
    '1375/07/31', '1375/01/00', '1400/12/30', '1404/12/30', '1405/07/05', '1500/01/01']) {
    assert.throws(() => parse(date), date);
  }
});

test('profile completion requires verified phone, name and birth date before clearing the pending step', () => {
  const a = app();
  loadProfileDetails(a);
  assert.throws(() => a.auth.completeProfile('علی', '1375/06/15', '09179095028'));
  a.auth.login('09179095028', '1234', true);
  for (const [name, date] of [['  ', '1375/06/15'], ['علی', ''], ['علی', '1400/12/30'], ['x'.repeat(101), '1375/06/15']]) {
    assert.throws(() => a.auth.completeProfile(name, date, '09179095028'));
    assert.equal(a.auth.needsProfile(), true);
  }
  assert.throws(() => a.auth.completeProfile('علی', '1375/06/15', '09961217945'));
  a.auth.completeProfile('  علی   رضایی  ', '۱۳۷۵/۰۶/۱۵', '09179095028');
  assert.equal(a.auth.needsProfile(), false);
  assert.equal(a.context.P.store.profile().name, 'علی رضایی');
  assert.equal(a.context.P.store.profile().birthDate, '1375-06-15');
  assert.equal(a.context.P.store.profile().birthCalendar, 'persian');
  assert.equal(app('profile.html', Object.fromEntries(a.storage)).location.redirect, undefined);
});

test('pending details survive refresh and guard every protected route including owner admin pages', () => {
  const a = app();
  a.auth.login(OWNERS[0], '1234', true);
  for (const file of protectedPages) {
    const restored = app(file, Object.fromEntries(a.storage));
    assert.equal(restored.auth.needsProfile(), true);
    assert.equal(restored.location.redirect, 'login.html?next=' + encodeURIComponent(file));
  }
  loadProfileDetails(a);
  a.auth.completeProfile('مالک', '1375/06/15', OWNERS[0]);
  assert.equal(a.auth.destination('admin-settings.html'), 'admin-settings.html');
  assert.equal(app('admin-settings.html', Object.fromEntries(a.storage)).location.redirect, undefined);
});

test('birthday persists through name edits, logout and per-number logins', () => {
  const a = app();
  loadProfileDetails(a);
  a.auth.login('09179095028', '1234', true);
  a.auth.completeProfile('علی', '1375/06/15', '09179095028');
  a.context.P.store.saveProfile({ name: 'رضا' });
  assert.equal(a.context.P.store.profile().birthDate, '1375-06-15');
  a.auth.logout();
  a.auth.login('09120000000', '1234', true);
  assert.equal(a.context.P.store.profile().birthDate, '');
  a.auth.completeProfile('مهدی', '1380/01/02', '09120000000');
  a.auth.logout();
  a.auth.login('09179095028', '1234', true);
  assert.equal(a.auth.needsProfile(), true); // Every fresh verified login confirms existing details.
  assert.equal(a.context.P.store.profile().name, 'رضا');
  assert.equal(a.context.P.store.profile().birthDate, '1375-06-15');
});

test('failed profile storage leaves login pending and does not write a completed session', () => {
  const a = app();
  loadProfileDetails(a);
  a.auth.login('09179095028', '1234', true);
  a.context.localStorage.setItem = () => { throw new Error('quota'); };
  assert.throws(() => a.auth.completeProfile('علی', '1375/06/15', '09179095028'));
  assert.equal(a.auth.needsProfile(), true);
});

test('login contains the requested birthday copy and accessible required profile fields', () => {
  const html = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
  assert(html.includes('تاریخ تولد خود را وارد کنید تا در روز تولد خود شامل تخفیف شوید'));
  assert.match(html, /<form id="detailsForm" hidden novalidate>/);
  assert.match(html, /id="loginName"[^>]*required/);
  for (const id of ['birthYear', 'birthMonth', 'birthDay']) {
    assert.match(html, new RegExp('<select id="' + id + '"[^>]*required[^>]*aria-describedby="birthDateHint loginError"'));
  }
  assert(!html.includes('id="loginBirthDate"'));
});


test('birthday picker offers accurate month lengths, including Jalali leap years', () => {
  const a = app();
  loadProfileDetails(a);
  const details = a.context.P.profileDetails;
  for (let month = 1; month <= 6; month++) assert.equal(details.daysInMonth(1400, month), 31);
  for (let month = 7; month <= 11; month++) assert.equal(details.daysInMonth(1400, month), 30);
  assert.equal(details.daysInMonth(1399, 12), 30);
  assert.equal(details.daysInMonth(1400, 12), 29);
  assert.equal(details.daysInMonth(1403, 12), 30);
  assert.equal(details.daysInMonth(1404, 12), 29);
  for (const [year, month] of [[0, 1], [1400, 0], [1400, 13], [1400.5, 1], [1400, 1.5]]) {
    assert.equal(details.daysInMonth(year, month), 0);
  }
  const today = details.today();
  assert(today.year > 1300 && today.month >= 1 && today.month <= 12 && today.day >= 1 && today.day <= 31);
});

function clubApp(initial = {}) {
  const a = app('login.html', initial);
  loadProfileDetails(a);
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/customer-club.js'), 'utf8'), a.context);
  return a;
}
function adminView(a, phone = OWNERS[0]) {
  a.storage.set(KEY, sessionFor(phone));
  return a.context.P.store.customers();
}

test('completed user details become one persistent club record with actual terms acceptance', () => {
  const a = clubApp();
  a.auth.login('۰۹۱۷۹۰۹۵۰۲۸', '1234', true);
  a.auth.completeProfile('علی', '1375/06/15', '09179095028');
  const profile = a.context.P.store.profile();
  assert.equal(profile.termsVersion, a.auth.termsVersion);
  assert.equal(profile.termsAcceptedAt, a.auth.session().termsAcceptedAt);
  assert.equal(profile.smsConsent, null);
  assert(profile.createdAt && profile.updatedAt);
  const created = profile.createdAt;
  a.auth.logout();
  let members = adminView(a);
  assert.equal(members.length, 1);
  assert.equal(members[0].phone, '09179095028');
  assert.equal(members[0].birthDate, '1375-06-15');
  a.auth.login('+989179095028', '1234', true);
  a.auth.completeProfile('رضا', '1375/06/15', '09179095028');
  members = adminView(a);
  assert.equal(members.length, 1);
  assert.equal(members[0].name, 'رضا');
  assert.equal(members[0].createdAt, created);
  a.context.P.store.saveBookings([{ customer: 'عضو ساختگی', phone: '09121111111' }]);
  assert.equal(a.context.P.store.customers().length, 1);
});

test('existing profiles are visible and deduplicated without retroactive acceptance', () => {
  const a = clubApp({
    'pirayesh-profile': JSON.stringify({ name: 'قدیمی', phone: '۰۹۱۷۹۰۹۵۰۲۸' }),
    'pirayesh-profile:09179095028': JSON.stringify({ name: 'جدید', phone: '09179095028', birthDate: '1370-01-02' }),
    'pirayesh-profile:09120000000': JSON.stringify({ name: 'کاربر دوم', birthDate: '' }),
    'pirayesh-profile:09121111111': '{bad', 'pirayesh-profile:invalid': '{"name":"bad"}'
  });
  const members = adminView(a);
  assert.equal(members.length, 2);
  assert.equal(members.find(m => m.phone === '09179095028').name, 'جدید');
  assert(members.every(m => m.termsAcceptedAt === null && m.termsVersion === null && m.createdAt === null));
  const csv = a.context.P.customerClub.csv();
  assert(csv.includes('09179095028') && csv.includes('09120000000'));
  assert(!csv.includes('terms-draft-v1')); // A contact export is not manufactured acceptance.
});

test('ordinary, anonymous, pending and outdated-terms sessions cannot export the club', () => {
  const a = clubApp({ 'pirayesh-profile:09179095028': JSON.stringify({ name: 'عضو' }) });
  for (const session of [null, sessionFor('09179095028'), JSON.stringify({ phone: OWNERS[0], demo: true, profilePending: true }), JSON.stringify({ phone: OWNERS[0], demo: true })]) {
    if (session) a.storage.set(KEY, session); else a.storage.delete(KEY);
    assert.equal(a.context.P.store.customers().length, 0);
    assert.equal(a.context.P.customerClub.csv(), '');
  }
  a.storage.set('pirayesh-demo-admins', '["09120000000"]');
  assert.equal(adminView(a, '09120000000').length, 1);
});

test('contact CSV includes all filtered members, records terms and escapes formulas', () => {
  const a = clubApp();
  for (const [phone, name, birth] of [
    ['09179095028', '=HYPERLINK("x")', '1375/06/15'],
    ['09120000000', 'علی', '1380/01/02'],
    ['09121111111', 'مهدی', '1375/06/15']
  ]) {
    a.auth.login(phone, '1234', true);
    a.auth.completeProfile(name, birth, phone);
  }
  adminView(a);
  const club = a.context.P.customerClub;
  assert.equal(club.members().length, 3);
  assert.equal(club.members({ query: '۰۹۱۷۹۰۹۵۰۲۸' }).length, 1);
  assert.equal(club.members({ query: '+989179095028' }).length, 1);
  assert.equal(club.members({ query: 'علي' }).length, 1);
  assert.equal(club.members({ month: '6' }).length, 2);
  const csv = club.csv({ month: '6' });
  assert(csv.includes('09179095028') && csv.includes('09121111111') && !csv.includes('09120000000'));
  assert(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert(csv.includes('terms_version') && csv.includes('terms_accepted_at') && csv.includes(a.auth.termsVersion));
});

test('legacy choices survive the terms login without being changed to automatic marketing consent', () => {
  const old = { name: 'علی', phone: '09179095028', birthDate: '1375-06-15',
    smsConsent: false, smsConsentUpdatedAt: '2026-01-01T00:00:00.000Z', smsConsentVersion: 'offers-v1' };
  const a = clubApp({ 'pirayesh-profile:09179095028': JSON.stringify(old) });
  a.auth.login('09179095028', '1234', true);
  a.auth.completeProfile('رضا', '1375/06/15', '09179095028');
  a.context.P.store.saveProfile({ name: 'نام جدید' });
  const saved = a.context.P.store.profile();
  assert.equal(saved.smsConsent, false);
  assert.equal(saved.smsConsentUpdatedAt, old.smsConsentUpdatedAt);
  assert.equal(saved.termsAcceptedAt, a.auth.session().termsAcceptedAt);
  assert.equal(saved.birthDate, old.birthDate);
});

test('login requires an explicit agreement, and records it only after correct OTP', () => {
  const a = app();
  for (const accepted of [undefined, false, 'true']) {
    assert.throws(() => a.auth.login('09179095028', '1234', accepted));
    assert.equal(a.auth.session(), null);
  }
  assert.throws(() => a.auth.login('09179095028', '0000', true));
  assert.equal(a.auth.session(), null);
  a.auth.login('09179095028', '1234', true);
  assert.equal(a.auth.session().termsVersion, a.auth.termsVersion);
  assert(Number.isFinite(Date.parse(a.auth.session().termsAcceptedAt)));
  assert.equal(a.auth.needsTerms(), false);
});

test('unaccepted or superseded terms redirect private pages to login without altering old records', () => {
  for (const version of [undefined, 'old-version']) {
    const saved = { phone: OWNERS[0], demo: true, termsVersion: version, termsAcceptedAt: '2026-01-01T00:00:00.000Z' };
    const a = app('admin-dashboard.html', { [KEY]: JSON.stringify(saved) });
    assert.equal(a.auth.needsTerms(), true);
    assert.equal(a.location.redirect, 'login.html?next=admin-dashboard.html');
    assert.equal(a.storage.get(KEY), JSON.stringify(saved));
  }
});

test('one preselected required terms agreement replaces standalone SMS UI, with public draft terms', () => {
  const login = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
  const agreement = login.match(/<input id="acceptTerms"[^>]*>/)[0];
  assert(agreement.includes('required') && agreement.includes('checked'));
  assert(!login.includes('href="terms.html"'));
  assert(!login.includes('مطالعه شرایط استفاده (پیش‌نویس)'));
  const terms = fs.readFileSync(path.join(root, 'terms.html'), 'utf8');
  assert(terms.includes('پیش‌نویس') && terms.includes('پیامک‌های') && terms.includes('توقف پیام'));
  assert(terms.includes(app().auth.termsVersion));
  for (const file of ['login.html', 'profile.html', 'admin-dashboard.html', 'assets/page-login.js', 'assets/page-profile.js', 'assets/page-customer-club.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const removed of ['loginSmsConsent', 'profileSmsConsent', 'clubConsentOnly', 'clubOptedIn', 'دارای رضایت پیامکی', 'پیامک تبلیغاتی:']) assert(!source.includes(removed), file + ':' + removed);
  }
  assert(fs.readFileSync(path.join(root, 'sw.js'), 'utf8').includes("'terms.html'"));
  assert.equal(app('terms.html').location.redirect, undefined);
});

test('guests and incomplete sessions can choose services, dates and times without a login redirect', () => {
  for (const session of [null, JSON.stringify({phone:'09179095028',demo:true}),
    JSON.stringify({...JSON.parse(sessionFor('09179095028')),profilePending:true})]) {
    const a = app('booking.html?s=vip#step3', session ? {[KEY]:session} : {});
    assert.equal(a.location.redirect, undefined);
    a.events.pageshow();
    assert.equal(a.location.redirect, undefined);
    assert.equal(a.context.document.documentElement.style.visibility, '');
    assert.equal(a.auth.safeNext('booking.html?s=vip#step3'), 'booking.html?s=vip#step3');
  }
});

test('final checkout gate preserves the complete draft through OTP and details then returns to payment', () => {
  const draft = JSON.stringify({serviceId:'vip',name:'VIP',price:350000,duration:'45',dateKey:'2026-10-01',time:'۱۰:۳۰'});
  const a = app('booking.html#step3', {'pirayesh-draft':draft});
  loadProfileDetails(a);
  assert.equal(a.auth.requireLogin('payment.html'), false);
  assert.equal(a.location.redirect, 'login.html?next=payment.html');
  assert.equal(a.storage.get('pirayesh-draft'), draft);
  assert.equal(a.storage.has('pirayesh-bookings'), false);
  a.auth.login('09179095028', '1234', true);
  assert.equal(a.auth.requireLogin('payment.html'), false);
  assert.equal(a.storage.get('pirayesh-draft'), draft);
  a.auth.completeProfile('علی', '1375/06/15', '09179095028');
  a.location.redirect = undefined;
  assert.equal(a.auth.requireLogin('payment.html'), true);
  assert.equal(a.location.redirect, undefined);
  assert.equal(a.auth.destination('payment.html'), 'payment.html');
  assert.equal(a.storage.get('pirayesh-draft'), draft);
  assert.equal(a.storage.has('pirayesh-bookings'), false);
});

test('payment remains protected and pending-booking query survives authentication', () => {
  const a = app('payment.html?b=BK-123');
  assert.equal(a.location.redirect, 'login.html?next=payment.html%3Fb%3DBK-123');
  assert.equal(a.auth.destination('payment.html?b=BK-123'), 'payment.html?b=BK-123');
  const ready = app('booking.html', {[KEY]:sessionFor('09179095028')});
  assert.equal(ready.auth.requireLogin('payment.html'), true);
  assert.equal(ready.location.redirect, undefined);
});
