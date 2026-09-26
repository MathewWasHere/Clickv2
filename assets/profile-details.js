/* Jalali birth-date validation for the login profile step. No Gregorian date picker. */
(function () {
  window.P = window.P || {};
  var calendar = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC'
  });
  var todayCalendar = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'Asia/Tehran'
  });
  function parts(formatter, date) {
    var result = {};
    formatter.formatToParts(date).forEach(function (part) { result[part.type] = part.value; });
    return [+result.year, +result.month, +result.day];
  }
  function key(date) { return date[0] * 10000 + date[1] * 100 + date[2]; }
  function invalid(field, message) {
    var error = new Error(message);
    error.field = field;
    throw error;
  }

  function calendarDateExists(y, m, d) {
    var target = key([y, m, d]);
    // Find the corresponding Gregorian day with Intl's Persian calendar. This
    // also rejects Esfand 30 in non-leap years, without approximate leap formulas.
    var dayMs = 86400000;
    var low = Math.floor(Date.UTC(y + 621, 2, 15) / dayMs);
    var high = Math.floor(Date.UTC(y + 622, 2, 25) / dayMs);
    var found = false;
    while (low <= high) {
      var middle = Math.floor((low + high) / 2);
      var actual = key(parts(calendar, new Date(middle * dayMs)));
      if (actual === target) { found = true; break; }
      if (actual < target) low = middle + 1;
      else high = middle - 1;
    }
    return found;
  }

  function birthDate(value, now) {
    var text = P.auth.digits(value).trim();
    var match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(text);
    if (!match) invalid('birthDate', 'سال، ماه و روز تولد خود را کامل انتخاب کنید.');
    var y = +match[1], m = +match[2], d = +match[3];
    if (y < 1 || m < 1 || m > 12 || d < 1 || d > (m <= 6 ? 31 : 30)) {
      invalid('birthDate', 'تاریخ تولد معتبر نیست. سال، ماه و روز را بررسی کنید.');
    }
    var target = key([y, m, d]);
    if (target > key(parts(todayCalendar, now || new Date()))) {
      invalid('birthDate', 'تاریخ تولد نمی‌تواند در آینده باشد.');
    }
    if (!calendarDateExists(y, m, d)) invalid('birthDate', 'این روز در تقویم شمسی وجود ندارد. تاریخ تولد را بررسی کنید.');
    return String(y).padStart(4, '0') + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  P.profileDetails = {
    birthDate: birthDate,
    today: function () {
      var date = parts(todayCalendar, new Date());
      return { year: date[0], month: date[1], day: date[2] };
    },
    daysInMonth: function (year, month) {
      if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12) return 0;
      if (month <= 6) return 31;
      if (month <= 11) return 30;
      return calendarDateExists(year, 12, 30) ? 30 : 29;
    },
    validate: function (name, date) {
      name = String(name || '').trim().replace(/\s+/g, ' ');
      if (!name || name.length > 100) invalid('name', 'نام و نام خانوادگی خود را وارد کنید (حداکثر ۱۰۰ نویسه).');
      return { name: name, birthDate: birthDate(date), birthCalendar: 'persian' };
    }
  };
})();
