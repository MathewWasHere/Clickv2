/* profile page: load/save user info */
(function () {
  var p = P.store.profile();
  var inputName = document.getElementById('inputName');
  var inputPhone = document.getElementById('inputPhone');

  function render() {
    document.getElementById('profName').textContent = p.name;
    document.getElementById('profPhone').textContent = p.phone;
    document.getElementById('profAvatar').textContent = (p.name || 'ک').trim().charAt(0);
    inputName.value = p.name;
    inputPhone.value = p.phone;
  }

  document.getElementById('saveProfile').addEventListener('click', function () {
    p = { name: inputName.value.trim() || p.name, phone: inputPhone.value.trim() || p.phone };
    P.store.saveProfile(p);
    render();
    P.toast('تغییرات ذخیره شد');
  });

  render();
})();
