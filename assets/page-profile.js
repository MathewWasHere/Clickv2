/* profile page: load/save user info */
(function () {
  function updateAdminAccess() {
    document.getElementById('adminPanelLink').hidden = !P.auth.isAdmin();
    document.getElementById('adminAccessNotice').hidden = P.auth.isAdmin() ||
      new URLSearchParams(location.search).get('admin') !== 'denied';
  }
  updateAdminAccess();
  window.addEventListener('pageshow', updateAdminAccess);
  var p = P.store.profile();
  var inputName = document.getElementById('inputName');
  var inputPhone = document.getElementById('inputPhone');

  function render() {
    document.getElementById('profName').textContent = p.name;
    document.getElementById('profPhone').textContent = p.phone;
    inputName.value = p.name;
    inputPhone.value = p.phone;
    document.getElementById('inputBirthDate').value = p.birthDate ? P.fa(p.birthDate.replace(/-/g, '/')) : '—';
  }

  document.getElementById('saveProfile').addEventListener('click', function () {
    var error = document.getElementById('profileSaveError');
    error.hidden = true;
    try {
      P.store.saveProfile({ name: inputName.value.trim() || p.name });
      p = P.store.profile();
      render();
      P.toast('تغییرات ذخیره شد');
    } catch (e) {
      error.textContent = 'ذخیره اطلاعات ممکن نیست. لطفاً دوباره تلاش کنید.';
      error.hidden = false;
    }
  });

  render();
})();
