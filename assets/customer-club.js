/* Browser-local customer club. Reads saved profiles, never invents members from demo bookings. */
(function () {
  function text(value) {
    return P.auth.digits(value).replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim().toLowerCase();
  }
  function members(filters) {
    filters = filters || {};
    var query = text(filters.query || '');
    var phoneQuery = P.auth.normalizePhone(query) || query.replace(/[\s()\-]/g, '');
    return P.store.customers().filter(function (member) {
      return (!query || text(member.name).indexOf(query) !== -1 || member.phone.indexOf(phoneQuery) !== -1) &&
        (!filters.month || +member.birthDate.split('-')[1] === +filters.month);
    });
  }
  function csvCell(value) {
    var content = String(value || '');
    // Prevent customer names from becoming spreadsheet formulas on export.
    if (/^\s*[=+@-]/.test(content) || /^[\t\r\n]/.test(content)) content = "'" + content;
    return '"' + content.replace(/"/g, '""') + '"';
  }
  P.customerClub = {
    members: members,
    csv: function (filters) {
      // Re-read records and admin permissions at export time. This is a contact export, not permission to send messages.
      var selected = members(filters);
      if (!selected.length) return '';
      var rows = [['name', 'phone', 'birth_date_jalali', 'birth_calendar', 'joined_at', 'terms_version', 'terms_accepted_at']];
      selected.forEach(function (member) {
        rows.push([member.name, member.phone, member.birthDate, member.birthCalendar, member.createdAt, member.termsVersion, member.termsAcceptedAt]);
      });
      return '\uFEFF' + rows.map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');
    }
  };
})();
